/**
 * @file test/interfaces/baseInterface.modelDiscovery.simple.test.js
 * @description Simple unit tests for BaseInterface model discovery functionality
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
    
    // Prevent automatic initialization for testing
    this.initializeModels = () => {};
    
    // Reset state to initializing for testing
    this.initializationState = {
      status: 'initializing',
      startTime: Date.now(),
      progress: 0,
      message: 'Initializing model discovery...',
      modelsCount: 0,
      error: null
    };
  }
}

describe('BaseInterface Model Discovery - Basic Tests', () => {
  let testInterface;

  beforeEach(() => {
    testInterface = new TestInterface();
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

  // Test Group 2: Model Response Parsing Tests
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

  // Test Group 3: Model Capability Detection Tests
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

    test('should detect TTS models as audio capable', () => {
      const model = { name: 'tts-1' };
      const capabilities = testInterface.detectModelCapabilities(model);
      
      expect(capabilities.audio).toBe(true);
      expect(capabilities.chat).toBe(false);
    });
  });

  // Test Group 4: Model Data Enrichment Tests
  describe('enrichModelData()', () => {
    test('should enrich model data with provider and capabilities', async () => {
      const models = [
        { id: 'test-model', name: 'test-model' },
        { id: 'test-vision-model', name: 'test-4v-model' }
      ];

      const result = await testInterface.enrichModelData(models);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        id: 'test-model',
        name: 'test-model',
        provider: 'test',
        capabilities: expect.any(Object),
        lastUpdated: expect.any(String)
      }));
      
      expect(result[1].capabilities.vision).toBe(true);
    });

    test('should add current timestamp to lastUpdated', async () => {
      const models = [{ id: 'test-model', name: 'test-model' }];
      const before = Date.now();
      
      const result = await testInterface.enrichModelData(models);
      const after = Date.now();
      
      const lastUpdatedTime = new Date(result[0].lastUpdated).getTime();
      expect(lastUpdatedTime).toBeGreaterThanOrEqual(before);
      expect(lastUpdatedTime).toBeLessThanOrEqual(after);
    });
  });

  // Test Group 5: State Management Tests
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

    test('should preserve existing state values not being updated', () => {
      const originalStatus = testInterface.initializationState.status;
      const originalError = testInterface.initializationState.error;

      testInterface.updateInitializationState({
        progress: 75
      });

      expect(testInterface.initializationState.status).toBe(originalStatus);
      expect(testInterface.initializationState.error).toBe(originalError);
      expect(testInterface.initializationState.progress).toBe(75);
    });
  });

  // Test Group 6: Configuration Tests
  describe('Configuration handling', () => {
    test('should have correct config structure', () => {
      expect(testInterface.config.test).toBeDefined();
      expect(testInterface.config.test.modelsEndpoint).toBe('https://api.test.com/v1/models');
      expect(testInterface.config.test.modelsFile).toBe('./data/models/test.json');
      expect(testInterface.config.test.model.default).toBe('test-model-default');
    });

    test('should handle missing config gracefully', () => {
      const noConfigInterface = new TestInterface();
      noConfigInterface.config = { test: {} };
      
      // Should not throw when accessing missing config
      expect(() => {
        noConfigInterface.detectModelCapabilities({ name: 'test' });
      }).not.toThrow();
    });
  });

  // Test Group 7: Edge Cases
  describe('Edge cases', () => {
    test('should handle empty model names', () => {
      const capabilities = testInterface.detectModelCapabilities({ name: '' });
      
      expect(capabilities).toEqual({
        chat: true,
        streaming: true,
        embeddings: false,
        vision: false,
        audio: false,
        jsonMode: true
      });
    });

    test('should handle undefined model names', () => {
      const capabilities = testInterface.detectModelCapabilities({});
      
      expect(capabilities.chat).toBe(true);
      expect(capabilities.embeddings).toBe(false);
    });

    test('should handle case insensitive model name matching', () => {
      const capabilities1 = testInterface.detectModelCapabilities({ name: 'GPT-4V-PREVIEW' });
      const capabilities2 = testInterface.detectModelCapabilities({ name: 'gpt-4v-preview' });
      
      expect(capabilities1.vision).toBe(true);
      expect(capabilities2.vision).toBe(true);
    });

    test('should handle models with multiple capability indicators', () => {
      const capabilities = testInterface.detectModelCapabilities({ name: 'gpt-4o-vision-model' });
      
      expect(capabilities.vision).toBe(true);
      // Should prioritize vision over embedding when both patterns present
      expect(capabilities.embeddings).toBe(false);
      expect(capabilities.chat).toBe(true);
    });
  });
});
