/**
 * @file src/interfaces/tencent.js
 * @class Tencent
 * @description Wrapper class for the Tencent Hunyuan API.
 * @param {string} apiKey - The API key for the Tencent Hunyuan API.
 */

const BaseInterface = require('./baseInterface.js');
const { tencentApiKey } = require('../utils/loadApiKeysFromEnv.js');
const { getConfig, loadProviderConfig } = require('../utils/configManager.js');

const interfaceName = 'tencent';

loadProviderConfig(interfaceName);
const config = getConfig();

class Tencent extends BaseInterface {
  constructor(apiKey) {
    super(interfaceName, apiKey || tencentApiKey, config[interfaceName].url);
  }

  /**
   * Builds the request body for the Tencent Hunyuan API request.
   * @param {string} model - The model to use for the request.
   * @param {Array<object>} messages - An array of message objects.
   * @param {number} max_tokens - The maximum number of tokens for the response.
   * @param {object} options - Additional options for the API request.
   * @returns {object} The constructed request body.
   */
  buildRequestBody(model, messages, max_tokens, options) {
    return {
      Model: model,
      Messages: messages.map(msg => ({
        Role: msg.role,
        Content: msg.content
      })),
      MaxTokens: max_tokens,
      Temperature: options.temperature || 0.7,
      TopP: options.top_p || 0.9,
      Stream: options.stream || false,
      ...options
    };
  }

  /**
   * Parse models response for Tencent Hunyuan format
   * @param {object} data - API response data
   * @returns {Array} Array of model objects
   */
  parseModelsResponse(data) {
    // Handle Tencent specific response format
    if (data.Response && data.Response.Models && Array.isArray(data.Response.Models)) {
      return data.Response.Models.map(model => ({
        id: model.ModelId || model.Id,
        name: model.ModelName || model.ModelId || model.Id,
        object: 'model',
        created: Date.now(),
        owned_by: 'tencent'
      }));
    }
    return [];
  }

  /**
   * Detect model capabilities for Tencent models
   * @param {object} model - Model information
   * @returns {object} Model capabilities
   */
  detectModelCapabilities(model) {
    const capabilities = super.detectModelCapabilities(model);
    
    const name = (model.name || '').toLowerCase();
    // Tencent Hunyuan models
    if (name.includes('hunyuan')) {
      capabilities.chat = true;
    }
    
    return capabilities;
  }
}

module.exports = Tencent;
