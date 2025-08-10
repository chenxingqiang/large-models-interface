/**
 * @file src/interfaces/bytedance.js
 * @class ByteDance
 * @description Wrapper class for the ByteDance Doubao (Volcano Engine) API.
 * @param {string} apiKey - The API key for the ByteDance Doubao API.
 */

const BaseInterface = require('./baseInterface.js');
const { bytedanceApiKey } = require('../utils/loadApiKeysFromEnv.js');
const { getConfig, loadProviderConfig } = require('../utils/configManager.js');

const interfaceName = 'bytedance';

loadProviderConfig(interfaceName);
const config = getConfig();

class ByteDance extends BaseInterface {
  constructor(apiKey) {
    super(interfaceName, apiKey || bytedanceApiKey, config[interfaceName].url);
  }

  /**
   * Builds the request body for the ByteDance Doubao API request.
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
   * Parse models response for ByteDance Doubao format
   * @param {object} data - API response data
   * @returns {Array} Array of model objects
   */
  parseModelsResponse(data) {
    // Handle ByteDance specific response format
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(model => ({
        id: model.id || model.model,
        name: model.name || model.id || model.model,
        object: 'model',
        created: model.created || Date.now(),
        owned_by: 'bytedance'
      }));
    }
    return [];
  }

  /**
   * Detect model capabilities for ByteDance models
   * @param {object} model - Model information
   * @returns {object} Model capabilities
   */
  detectModelCapabilities(model) {
    const capabilities = super.detectModelCapabilities(model);
    
    const name = (model.name || '').toLowerCase();
    // ByteDance Doubao models with vision capabilities
    if (name.includes('doubao') && name.includes('vision')) {
      capabilities.vision = true;
    }
    
    return capabilities;
  }
}

module.exports = ByteDance;
