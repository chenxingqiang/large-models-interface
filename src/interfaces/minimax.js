/**
 * @file src/interfaces/minimax.js
 * @class MINIMAX
 * @description Wrapper class for the MINIMAX AI API.
 * @param {string} apiKey - The API key for the MINIMAX AI API.
 */

const BaseInterface = require('./baseInterface.js');
const { minimaxApiKey } = require('../utils/loadApiKeysFromEnv.js');
const { getConfig, loadProviderConfig } = require('../utils/configManager.js');

const interfaceName = 'minimax';

loadProviderConfig(interfaceName);
const config = getConfig();

class MINIMAX extends BaseInterface {
  constructor(apiKey) {
    super(interfaceName, apiKey || minimaxApiKey, config[interfaceName].url);
  }

  /**
   * Builds the request body for the MINIMAX API request.
   * @param {string} model - The model to use for the request.
   * @param {Array<object>} messages - An array of message objects.
   * @param {number} max_tokens - The maximum number of tokens for the response.
   * @param {object} options - Additional options for the API request.
   * @returns {object} The constructed request body.
   */
  buildRequestBody(model, messages, max_tokens, options) {
    return {
      model: model,
      messages: messages,
      max_tokens: max_tokens,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 0.9,
      stream: options.stream || false,
      tokens_to_generate: max_tokens,
      ...options
    };
  }

  /**
   * Parse models response for MINIMAX format
   * @param {object} data - API response data
   * @returns {Array} Array of model objects
   */
  parseModelsResponse(data) {
    // Handle MINIMAX specific response format
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(model => ({
        id: model.id || model.model_name,
        name: model.model_name || model.id,
        object: 'model',
        created: model.created || Date.now(),
        owned_by: 'minimax'
      }));
    }
    return [];
  }

  /**
   * Adjust embedding prompt for MINIMAX format
   * @param {string} prompt - The input prompt to adjust
   * @returns {Array} The adjusted embedding prompt
   */
  adjustEmbeddingPrompt(prompt) {
    return [prompt];
  }

  /**
   * Detect model capabilities for MINIMAX models
   * @param {object} model - Model information
   * @returns {object} Model capabilities
   */
  detectModelCapabilities(model) {
    const capabilities = super.detectModelCapabilities(model);
    
    const name = (model.name || '').toLowerCase();
    // MINIMAX models
    if (name.includes('abab')) {
      capabilities.chat = true;
      // MINIMAX embedding models
      if (name.includes('embo')) {
        capabilities.embeddings = true;
        capabilities.chat = false;
      }
    }
    
    return capabilities;
  }
}

module.exports = MINIMAX;
