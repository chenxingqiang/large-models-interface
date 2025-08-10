/**
 * @file src/interfaces/yi.js
 * @class Yi
 * @description Wrapper class for the 01.AI (零一万物) Yi API.
 * @param {string} apiKey - The API key for the Yi API.
 */

const BaseInterface = require('./baseInterface.js');
const { yiApiKey } = require('../utils/loadApiKeysFromEnv.js');
const { getConfig, loadProviderConfig } = require('../utils/configManager.js');

const interfaceName = 'yi';

loadProviderConfig(interfaceName);
const config = getConfig();

class Yi extends BaseInterface {
  constructor(apiKey) {
    super(interfaceName, apiKey || yiApiKey, config[interfaceName].url);
  }

  /**
   * Builds the request body for the Yi API request.
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
   * Parse models response for Yi format
   * @param {object} data - API response data
   * @returns {Array} Array of model objects
   */
  parseModelsResponse(data) {
    // Handle Yi specific response format (OpenAI-compatible)
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(model => ({
        id: model.id,
        name: model.id,
        object: model.object || 'model',
        created: model.created || Date.now(),
        owned_by: 'yi'
      }));
    }
    return [];
  }

  /**
   * Detect model capabilities for Yi models
   * @param {object} model - Model information
   * @returns {object} Model capabilities
   */
  detectModelCapabilities(model) {
    const capabilities = super.detectModelCapabilities(model);
    
    const name = (model.name || '').toLowerCase();
    // Yi models
    if (name.includes('yi')) {
      capabilities.chat = true;
      // Yi vision models
      if (name.includes('vision') || name.includes('vl')) {
        capabilities.vision = true;
      }
      // Yi large models
      if (name.includes('large') || name.includes('34b')) {
        capabilities.largeContext = true;
      }
    }
    
    return capabilities;
  }
}

module.exports = Yi;
