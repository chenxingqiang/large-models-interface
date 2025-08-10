/**
 * @file src/interfaces/xai.js
 * @class xAI
 * @description Wrapper class for the xAI (Grok) API.
 * @param {string} apiKey - The API key for the xAI API.
 */

const BaseInterface = require('./baseInterface.js');
const { xaiApiKey } = require('../utils/loadApiKeysFromEnv.js');
const { getConfig, loadProviderConfig } = require('../utils/configManager.js');

const interfaceName = 'xai';

loadProviderConfig(interfaceName);
const config = getConfig();

class xAI extends BaseInterface {
  constructor(apiKey) {
    super(interfaceName, apiKey || xaiApiKey, config[interfaceName].url);
  }

  /**
   * Builds the request body for the xAI API request.
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
      ...options
    };
  }

  /**
   * Parse models response for xAI format
   * @param {object} data - API response data
   * @returns {Array} Array of model objects
   */
  parseModelsResponse(data) {
    // Handle xAI specific response format (OpenAI-compatible)
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(model => ({
        id: model.id,
        name: model.id,
        object: model.object || 'model',
        created: model.created || Date.now(),
        owned_by: 'xai'
      }));
    }
    return [];
  }

  /**
   * Detect model capabilities for xAI models
   * @param {object} model - Model information
   * @returns {object} Model capabilities
   */
  detectModelCapabilities(model) {
    const capabilities = super.detectModelCapabilities(model);
    
    const name = (model.name || '').toLowerCase();
    // xAI Grok models
    if (name.includes('grok')) {
      capabilities.chat = true;
      // Grok has real-time access to X (Twitter)
      capabilities.realTimeData = true;
    }
    
    return capabilities;
  }
}

module.exports = xAI;
