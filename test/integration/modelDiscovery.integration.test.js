/**
 * @file test/integration/modelDiscovery.integration.test.js
 * @description Integration tests for the complete model discovery system
 */

const BaseInterface = require('../../src/interfaces/baseInterface');
const initializationMonitor = require('../../src/utils/initializationMonitor');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  'testprovider': {
    modelsEndpoint: 'https://api.testprovider.com/v1/models',
    modelsFile: './test-data/models/testprovider.json',
    model: {
      default: 'test-model-default',
      large: 'test-model-large'
    },
    stream: true,
    jsonMode: true
  }
};

// Test interface class
class TestProviderInterface extends BaseInterface {
  constructor() {
    super('testprovider', 'test-api-key', 'https://api.testprovider.com');
    this.config = TEST_CONFIG;
  }
}

describe('Model Discovery Integration Tests', () => {
  let testInterface;
  let mockConsoleLog;
  let mockConsoleWarn;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    
    // Reset initialization monitor
    initializationMonitor.reset();
    
    // Clean up test data directory
    try {
      await fs.rmdir('./test-data', { recursive: true });
    } catch (error) {
      // Directory doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    mockConsoleLog.mockRestore();
    mockConsoleWarn.mockRestore();
    
    // Clean up test data
    try {
      await fs.rmdir('./test-data', { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Complete Model Discovery Flow', () => {
    test('should complete full discovery and caching workflow', async () => {
      // Mock successful API response
      const mockModelsResponse = {
        data: [
          { 
            id: 'test-model-v1', 
            object: 'model', 
            created: 1704067200, 
            owned_by: 'testprovider' 
          },
          { 
            id: 'test-model-v2-vision', 
            object: 'model', 
            created: 1704153600, 
            owned_by: 'testprovider' 
          },
          { 
            id: 'test-embedding-model', 
            object: 'model', 
            created: 1704240000, 
            owned_by: 'testprovider' 
          }
        ]
      };

      // Create interface and mock HTTP client
      testInterface = new TestProviderInterface();
      testInterface.client.get = jest.fn().mockResolvedValue({
        data: mockModelsResponse
      });

      // Register with monitor
      initializationMonitor.registerInterface('testprovider', testInterface);

      // Wait for initialization to complete
      const report = await initializationMonitor.waitForAllInterfaces(5000);

      // Verify global state
      expect(report.global.status).toBe('completed');
      expect(report.global.totalModels).toBe(3);
      expect(report.global.completedInterfaces).toBe(1);

      // Verify interface state
      expect(report.interfaces.testprovider.status).toBe('completed');
      expect(report.interfaces.testprovider.modelsCount).toBe(3);

      // Verify models file was created
      const modelsFile = './test-data/models/testprovider.json';
      expect(await fs.access(modelsFile).then(() => true).catch(() => false)).toBe(true);

      // Verify file contents
      const fileContent = await fs.readFile(modelsFile, 'utf8');
      const savedData = JSON.parse(fileContent);
      
      expect(savedData.provider).toBe('testprovider');
      expect(savedData.totalModels).toBe(3);
      expect(savedData.models).toHaveLength(3);
      
      // Verify model capabilities were detected
      const visionModel = savedData.models.find(m => m.name === 'test-model-v2-vision');
      expect(visionModel.capabilities.vision).toBe(true);
      
      const embeddingModel = savedData.models.find(m => m.name === 'test-embedding-model');
      expect(embeddingModel.capabilities.embeddings).toBe(true);
      expect(embeddingModel.capabilities.chat).toBe(false);
    });

    test('should handle API failure and use cached data', async () => {
      // First, create a cache file
      const modelsFile = './test-data/models/testprovider.json';
      await fs.mkdir(path.dirname(modelsFile), { recursive: true });
      
      const cachedData = {
        provider: 'testprovider',
        lastUpdated: '2024-01-01T00:00:00Z',
        totalModels: 2,
        models: [
          {
            id: 'cached-model-1',
            name: 'cached-model-1',
            provider: 'testprovider',
            capabilities: { chat: true, streaming: true }
          },
          {
            id: 'cached-model-2',
            name: 'cached-model-2', 
            provider: 'testprovider',
            capabilities: { chat: true, streaming: true }
          }
        ],
        aliases: TEST_CONFIG.testprovider.model
      };
      
      await fs.writeFile(modelsFile, JSON.stringify(cachedData, null, 2));

      // Create interface and mock API failure
      testInterface = new TestProviderInterface();
      testInterface.client.get = jest.fn().mockRejectedValue(new Error('Network timeout'));

      // Register and wait for initialization
      initializationMonitor.registerInterface('testprovider', testInterface);
      const report = await initializationMonitor.waitForAllInterfaces(5000);

      // Verify cached state was used
      expect(report.global.status).toBe('completed'); // Cached counts as completed
      expect(report.interfaces.testprovider.status).toBe('cached');
      expect(report.interfaces.testprovider.modelsCount).toBe(2);
      expect(report.interfaces.testprovider.error).toContain('Network timeout');

      // Verify getAvailableModels works with cache
      const availableModels = await testInterface.getAvailableModels();
      expect(availableModels).toHaveLength(2);
      expect(availableModels[0].name).toBe('cached-model-1');
    });

    test('should gracefully degrade to static config when everything fails', async () => {
      // Create interface and mock both API and file failures
      testInterface = new TestProviderInterface();
      testInterface.client.get = jest.fn().mockRejectedValue(new Error('API Error'));

      // Register and wait for initialization
      initializationMonitor.registerInterface('testprovider', testInterface);
      const report = await initializationMonitor.waitForAllInterfaces(5000);

      // Verify failed state
      expect(report.interfaces.testprovider.status).toBe('failed');
      expect(report.interfaces.testprovider.error).toContain('API Error');

      // But getAvailableModels should still work with static config
      const availableModels = await testInterface.getAvailableModels();
      expect(availableModels.length).toBeGreaterThan(0);
      expect(availableModels[0].name).toBe('test-model-default');
    });
  });

  describe('Multiple Provider Integration', () => {
    test('should handle multiple providers initializing simultaneously', async () => {
      // Create multiple test interfaces
      const providers = ['provider1', 'provider2', 'provider3'];
      const interfaces = [];

      for (const provider of providers) {
        const config = {
          [provider]: {
            modelsEndpoint: `https://api.${provider}.com/v1/models`,
            modelsFile: `./test-data/models/${provider}.json`,
            model: { default: `${provider}-default` },
            stream: true
          }
        };

        class TestInterface extends BaseInterface {
          constructor() {
            super(provider, 'api-key', `https://api.${provider}.com`);
            this.config = config;
          }
        }

        const interface_ = new TestInterface();
        interface_.client.get = jest.fn().mockResolvedValue({
          data: { 
            data: Array.from({ length: 5 }, (_, i) => ({
              id: `${provider}-model-${i}`,
              object: 'model',
              created: Date.now(),
              owned_by: provider
            }))
          }
        });

        interfaces.push(interface_);
        initializationMonitor.registerInterface(provider, interface_);
      }

      // Wait for all to complete
      const report = await initializationMonitor.waitForAllInterfaces(10000);

      // Verify all succeeded
      expect(report.global.status).toBe('completed');
      expect(report.global.totalInterfaces).toBe(3);
      expect(report.global.completedInterfaces).toBe(3);
      expect(report.global.totalModels).toBe(15); // 5 models per provider

      // Verify each provider has its models file
      for (const provider of providers) {
        const modelsFile = `./test-data/models/${provider}.json`;
        expect(await fs.access(modelsFile).then(() => true).catch(() => false)).toBe(true);
        
        const fileContent = await fs.readFile(modelsFile, 'utf8');
        const savedData = JSON.parse(fileContent);
        expect(savedData.provider).toBe(provider);
        expect(savedData.totalModels).toBe(5);
      }
    });

    test('should handle mixed success and failure scenarios', async () => {
      const successInterface = new TestProviderInterface();
      successInterface.interfaceName = 'success';
      successInterface.config = {
        success: {
          modelsEndpoint: 'https://api.success.com/v1/models',
          modelsFile: './test-data/models/success.json',
          model: { default: 'success-default' }
        }
      };
      successInterface.client.get = jest.fn().mockResolvedValue({
        data: { data: [{ id: 'success-model', object: 'model', created: Date.now(), owned_by: 'success' }] }
      });

      const failInterface = new TestProviderInterface();
      failInterface.interfaceName = 'fail';
      failInterface.config = {
        fail: {
          modelsEndpoint: 'https://api.fail.com/v1/models',
          modelsFile: './test-data/models/fail.json',
          model: { default: 'fail-default' }
        }
      };
      failInterface.client.get = jest.fn().mockRejectedValue(new Error('Fail error'));

      // Register both
      initializationMonitor.registerInterface('success', successInterface);
      initializationMonitor.registerInterface('fail', failInterface);

      const report = await initializationMonitor.waitForAllInterfaces(5000);

      // Should be partial success
      expect(report.global.status).toBe('partial');
      expect(report.global.completedInterfaces).toBe(1);
      expect(report.global.failedInterfaces).toBe(1);
      expect(report.global.totalModels).toBe(1); // Only from success

      expect(report.interfaces.success.status).toBe('completed');
      expect(report.interfaces.fail.status).toBe('failed');
    });
  });

  describe('Performance and Timing', () => {
    test('should complete initialization within reasonable time', async () => {
      const startTime = Date.now();
      
      testInterface = new TestProviderInterface();
      testInterface.client.get = jest.fn().mockResolvedValue({
        data: { data: [{ id: 'fast-model', object: 'model', created: Date.now(), owned_by: 'test' }] }
      });

      initializationMonitor.registerInterface('testprovider', testInterface);
      await initializationMonitor.waitForAllInterfaces(5000);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds
    });

    test('should handle timeout gracefully', async () => {
      testInterface = new TestProviderInterface();
      // Mock a slow response
      testInterface.client.get = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );

      initializationMonitor.registerInterface('testprovider', testInterface);

      await expect(initializationMonitor.waitForAllInterfaces(500))
        .rejects.toThrow('Global initialization timeout');
    });
  });

  describe('File System Operations', () => {
    test('should create directory structure correctly', async () => {
      testInterface = new TestProviderInterface();
      testInterface.client.get = jest.fn().mockResolvedValue({
        data: { data: [{ id: 'test-model', object: 'model', created: Date.now(), owned_by: 'test' }] }
      });

      initializationMonitor.registerInterface('testprovider', testInterface);
      await initializationMonitor.waitForAllInterfaces(5000);

      // Verify directory structure
      expect(await fs.access('./test-data').then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access('./test-data/models').then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access('./test-data/models/testprovider.json').then(() => true).catch(() => false)).toBe(true);
    });

    test('should handle file write permissions gracefully', async () => {
      testInterface = new TestProviderInterface();
      testInterface.client.get = jest.fn().mockResolvedValue({
        data: { data: [{ id: 'test-model', object: 'model', created: Date.now(), owned_by: 'test' }] }
      });

      // Mock file system error
      const originalMkdir = fs.mkdir;
      fs.mkdir = jest.fn().mockRejectedValue(new Error('Permission denied'));

      initializationMonitor.registerInterface('testprovider', testInterface);
      
      const report = await initializationMonitor.waitForAllInterfaces(5000);
      
      // Should fail but not crash
      expect(report.interfaces.testprovider.status).toBe('failed');
      expect(report.interfaces.testprovider.error).toContain('Permission denied');

      // Restore original function
      fs.mkdir = originalMkdir;
    });
  });

  describe('Progress Reporting', () => {
    test('should log progress messages during initialization', async () => {
      testInterface = new TestProviderInterface();
      testInterface.client.get = jest.fn().mockResolvedValue({
        data: { data: [{ id: 'test-model', object: 'model', created: Date.now(), owned_by: 'test' }] }
      });

      initializationMonitor.registerInterface('testprovider', testInterface);
      await initializationMonitor.waitForAllInterfaces(5000);

      // Check that progress messages were logged
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Checking testprovider model endpoint')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('All interfaces initialized')
      );
    });

    test('should provide real-time status updates', async () => {
      testInterface = new TestProviderInterface();
      testInterface.client.get = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: { data: [{ id: 'test-model', object: 'model', created: Date.now(), owned_by: 'test' }] }
        }), 100))
      );

      initializationMonitor.registerInterface('testprovider', testInterface);

      // Check intermediate state
      const intermediateState = testInterface.getInitializationState();
      expect(intermediateState.status).toBe('initializing');

      await initializationMonitor.waitForAllInterfaces(5000);

      // Check final state
      const finalState = testInterface.getInitializationState();
      expect(finalState.status).toBe('completed');
      expect(finalState.progress).toBe(100);
    });
  });
});
