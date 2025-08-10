/**
 * @file src/interfaces/stepfun.js
 * @class StepFun
 * @description Wrapper class for the StepFun (阶跃星辰) API.
 * @param {string} apiKey - The API key for the StepFun API.
 */

const BaseInterface = require('./baseInterface.js');
const { stepfunApiKey } = require('../utils/loadApiKeysFromEnv.js');
const { getConfig, loadProviderConfig } = require('../utils/configManager.js');

const interfaceName = 'stepfun';

loadProviderConfig(interfaceName);
const config = getConfig();

class StepFun extends BaseInterface {
  constructor(apiKey) {
    super(interfaceName, apiKey || stepfunApiKey, config[interfaceName].url);
  }

  /**
   * Builds the request body for the StepFun API request.
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
   * Parse models response for StepFun format
   * @param {object} data - API response data
   * @returns {Array} Array of model objects
   */
  parseModelsResponse(data) {
    // Handle StepFun specific response format (OpenAI-compatible)
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(model => ({
        id: model.id,
        name: model.id,
        object: model.object || 'model',
        created: model.created || Date.now(),
        owned_by: 'stepfun'
      }));
    }
    return [];
  }

  /**
   * Detect model capabilities for StepFun models
   * @param {object} model - Model information
   * @returns {object} Model capabilities
   */
  detectModelCapabilities(model) {
    const capabilities = super.detectModelCapabilities(model);
    
    const name = (model.name || '').toLowerCase();
    // StepFun models
    if (name.includes('step')) {
      capabilities.chat = true;
      // StepFun vision models
      if (name.includes('v') || name.includes('vision')) {
        capabilities.vision = true;
      }
    }
    
    return capabilities;
  }
}

module.exports = StepFun;
