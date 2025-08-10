/**
 * @file test/interfaces/baseInterface.modelDiscovery.test.js
 * @description Unit tests for BaseInterface model discovery functionality
 */

const BaseInterface = require('../../src/interfaces/baseInterface');

// Test helper class
class TestInterface extends BaseInterface {
  constructor() {
    super('test', 'test-api-key', 'https://api.test.com');
    // Override config for testing
    this.config = {
      test: {
        modelsEndpoint: 'https://api.test.com/v1/models',
        modelsFile: './data/models/test.json',
        model: {
          default: 'test-model-default',
          large: 'test-model-large'
        },
        stream: true,
        jsonMode: true
      }
    };
  }
}

describe('BaseInterface Model Discovery', () => {
  let testInterface;

  beforeEach(() => {
    // Create fresh test interface
    testInterface = new TestInterface();
    
    // Stop automatic initialization for controlled testing
    testInterface.initializeModels = jest.fn();
  });

  // Test Group 1: Initialization State Management
  describe('getInitializationState()', () => {
    test('should return current initialization state', () => {
      const state = testInterface.getInitializationState();
      
      expect(state).toHaveProperty('status');
      expect(state).toHaveProperty('progress');
      expect(state).toHaveProperty('message');
      expect(state).toHaveProperty('modelsCount');
      expect(state).toHaveProperty('error');
      expect(state.status).toBe('initializing');
    });

    test('should return a copy of the state (not reference)', () => {
      const state1 = testInterface.getInitializationState();
      const state2 = testInterface.getInitializationState();
      
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('waitForInitialization()', () => {
    test('should resolve when initialization completes', async () => {
      // Set up completion state
      testInterface.initializationState.status = 'completed';
      
      const result = await testInterface.waitForInitialization();
      expect(result.status).toBe('completed');
    });

    test('should timeout after specified duration', async () => {
      // Keep status as initializing
      testInterface.initializationState.status = 'initializing';
      
      await expect(testInterface.waitForInitialization(100))
        .rejects.toThrow('Initialization timeout: 100ms');
    });

    test('should handle cached status as completed', async () => {
      testInterface.initializationState.status = 'cached';
      
      const result = await testInterface.waitForInitialization();
      expect(result.status).toBe('cached');
    });
  });

  // Test Group 2: Model File Update Tests
  describe('updateModelsFile()', () => {
    beforeEach(() => {
      // Restore the actual method for these tests
      testInterface.initializeModels.mockRestore();
    });

    test('should skip update when modelsEndpoint not configured', async () => {
      testInterface.config.test.modelsEndpoint = undefined;
      
      await testInterface.updateModelsFile();
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('model endpoint not configured')
      );
    });

    test('should successfully update models file when API responds', async () => {
      const mockModels = [
        { id: 'test-model-1', object: 'model', created: 1234567890, owned_by: 'test' },
        { id: 'test-model-2', object: 'model', created: 1234567891, owned_by: 'test' }
      ];

      testInterface.client.get = jest.fn().mockResolvedValue({
        data: { data: mockModels }
      });

      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await testInterface.updateModelsFile();

      expect(testInterface.client.get).toHaveBeenCalledWith(
        'https://api.test.com/v1/models'
      );
      expect(fs.writeFile).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('discovered 2 models')
      );
    });

    test('should throw error when API fails', async () => {
      testInterface.client.get = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(testInterface.updateModelsFile()).rejects.toThrow('Network error');
    });
  });

  // Test Group 3: Model Response Parsing Tests
  describe('parseModelsResponse()', () => {
    test('should correctly parse OpenAI format response', () => {
      const response = {
        data: [
          { id: 'gpt-4', object: 'model', created: 1234567890, owned_by: 'openai' },
          { id: 'gpt-3.5-turbo', object: 'model', created: 1234567891, owned_by: 'openai' }
        ]
      };

      const result = testInterface.parseModelsResponse(response);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'gpt-4',
        name: 'gpt-4',
        object: 'model',
        created: 1234567890,
        owned_by: 'openai'
      });
    });

    test('should return empty array for invalid response', () => {
      const result = testInterface.parseModelsResponse({});
      expect(result).toEqual([]);
    });

    test('should handle missing data field', () => {
      const result = testInterface.parseModelsResponse({ models: [] });
      expect(result).toEqual([]);
    });
  });

  // Test Group 4: Model Capability Detection Tests
  describe('detectModelCapabilities()', () => {
    test('should detect vision capability for vision models', () => {
      const model = { name: 'gpt-4v-preview' };
      const capabilities = testInterface.detectModelCapabilities(model);
      
      expect(capabilities.vision).toBe(true);
      expect(capabilities.chat).toBe(true);
    });

    test('should detect embedding capability for embedding models', () => {
      const model = { name: 'text-embedding-ada-002' };
      const capabilities = testInterface.detectModelCapabilities(model);
      
      expect(capabilities.embeddings).toBe(true);
      expect(capabilities.chat).toBe(false);
    });

    test('should detect audio capability for whisper models', () => {
      const model = { name: 'whisper-1' };
      const capabilities = testInterface.detectModelCapabilities(model);
      
      expect(capabilities.audio).toBe(true);
      expect(capabilities.chat).toBe(false);
    });

    test('should use config values for streaming and jsonMode', () => {
      const model = { name: 'standard-model' };
      const capabilities = testInterface.detectModelCapabilities(model);
      
      expect(capabilities.streaming).toBe(true); // from config
      expect(capabilities.jsonMode).toBe(true);  // from config
    });

    test('should detect GPT-4o as vision capable', () => {
      const model = { name: 'gpt-4o' };
      const capabilities = testInterface.detectModelCapabilities(model);
      
      expect(capabilities.vision).toBe(true);
    });
  });

  // Test Group 5: File Operations Tests
  describe('saveModelsFile() & getAvailableModels()', () => {
    test('should save models to correct file structure', async () => {
      const models = [
        { 
          id: 'test-model', 
          name: 'test-model', 
          provider: 'test',
          capabilities: { chat: true },
          lastUpdated: '2024-01-01T00:00:00Z'
        }
      ];

      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await testInterface.saveModelsFile(models);

      expect(fs.mkdir).toHaveBeenCalledWith('./data/models', { recursive: true });
      
      const writeCall = fs.writeFile.mock.calls[0];
      expect(writeCall[0]).toBe('./data/models/test.json');
      
      const savedData = JSON.parse(writeCall[1]);
      expect(savedData).toMatchObject({
        provider: 'test',
        totalModels: 1,
        models: models,
        aliases: testInterface.config.test.model
      });
    });

    test('should successfully read models from file', async () => {
      const mockFileContent = JSON.stringify({
        provider: 'test',
        models: [
          { id: 'cached-model', name: 'cached-model', provider: 'test' }
        ]
      });

      fs.readFile.mockResolvedValue(mockFileContent);

      const models = await testInterface.getAvailableModels();
      
      expect(models).toHaveLength(1);
      expect(models[0].name).toBe('cached-model');
    });

    test('should fall back to config when file read fails', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const models = await testInterface.getAvailableModels();
      
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('failed to read models file')
      );
      
      // Should return config-based models
      expect(models.length).toBeGreaterThan(0);
      expect(models[0].name).toBe('test-model-default');
    });
  });

  // Test Group 6: Integration Tests
  describe('initializeModels() - Full Integration', () => {
    beforeEach(() => {
      testInterface.initializeModels.mockRestore();
    });

    test('should complete full initialization flow successfully', async () => {
      const mockModels = [
        { id: 'test-model-1', object: 'model', created: 1234567890, owned_by: 'test' }
      ];

      testInterface.client.get = jest.fn().mockResolvedValue({
        data: { data: mockModels }
      });
      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();
      fs.readFile.mockResolvedValue(JSON.stringify({
        provider: 'test',
        models: mockModels.map(m => ({ ...m, provider: 'test', capabilities: {} }))
      }));

      await testInterface.initializeModels();

      expect(testInterface.initializationState.status).toBe('completed');
      expect(testInterface.initializationState.progress).toBe(100);
      expect(testInterface.initializationState.modelsCount).toBe(1);
    });

    test('should handle API failure and use cache', async () => {
      testInterface.client.get = jest.fn().mockRejectedValue(new Error('API Error'));
      
      const cachedModels = [{ id: 'cached-model', name: 'cached-model' }];
      fs.readFile.mockResolvedValue(JSON.stringify({
        provider: 'test',
        models: cachedModels
      }));

      await testInterface.initializeModels();

      expect(testInterface.initializationState.status).toBe('cached');
      expect(testInterface.initializationState.modelsCount).toBe(1);
      expect(testInterface.initializationState.error).toContain('API Error');
    });

    test('should handle both API and cache failure', async () => {
      testInterface.client.get = jest.fn().mockRejectedValue(new Error('API Error'));
      fs.readFile.mockRejectedValue(new Error('Cache Error'));

      await testInterface.initializeModels();

      expect(testInterface.initializationState.status).toBe('failed');
      expect(testInterface.initializationState.error).toContain('API Error');
      expect(testInterface.initializationState.error).toContain('Cache Error');
    });

    test('should handle missing modelsEndpoint gracefully', async () => {
      testInterface.config.test.modelsEndpoint = undefined;

      await testInterface.initializeModels();

      expect(testInterface.initializationState.status).toBe('completed');
      expect(testInterface.initializationState.message).toContain('no model endpoint configured');
    });
  });

  // Test Group 7: State Management Tests
  describe('updateInitializationState()', () => {
    test('should update state properties correctly', () => {
      const updates = {
        progress: 50,
        message: 'Test progress message',
        modelsCount: 5
      };

      testInterface.updateInitializationState(updates);

      expect(testInterface.initializationState.progress).toBe(50);
      expect(testInterface.initializationState.message).toBe('Test progress message');
      expect(testInterface.initializationState.modelsCount).toBe(5);
      expect(testInterface.initializationState.lastUpdated).toBeDefined();
    });

    test('should log message when provided', () => {
      testInterface.updateInitializationState({
        message: 'Test log message'
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Test log message')
      );
    });

    test('should not log when no message provided', () => {
      testInterface.updateInitializationState({
        progress: 75
      });

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });
});
