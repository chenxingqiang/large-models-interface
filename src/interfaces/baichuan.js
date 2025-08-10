/**
 * @file src/interfaces/baichuan.js
 * @class Baichuan
 * @description Wrapper class for the Baichuan AI API.
 * @param {string} apiKey - The API key for the Baichuan AI API.
 */

const BaseInterface = require('./baseInterface.js');
const { baichuanApiKey } = require('../utils/loadApiKeysFromEnv.js');
const { getConfig, loadProviderConfig } = require('../utils/configManager.js');

const interfaceName = 'baichuan';

loadProviderConfig(interfaceName);
const config = getConfig();

class Baichuan extends BaseInterface {
  constructor(apiKey) {
    super(interfaceName, apiKey || baichuanApiKey, config[interfaceName].url);
  }

  /**
   * Builds the request body for the Baichuan AI API request.
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
   * Parse models response for Baichuan AI format
   * @param {object} data - API response data
   * @returns {Array} Array of model objects
   */
  parseModelsResponse(data) {
    // Handle Baichuan specific response format
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(model => ({
        id: model.id || model.name,
        name: model.name || model.id,
        object: 'model',
        created: model.created || Date.now(),
        owned_by: 'baichuan'
      }));
    }
    return [];
  }

  /**
   * Detect model capabilities for Baichuan models
   * @param {object} model - Model information
   * @returns {object} Model capabilities
   */
  detectModelCapabilities(model) {
    const capabilities = super.detectModelCapabilities(model);
    
    const name = (model.name || '').toLowerCase();
    // Baichuan models
    if (name.includes('baichuan')) {
      capabilities.chat = true;
    }
    
    return capabilities;
  }
}

module.exports = Baichuan;
