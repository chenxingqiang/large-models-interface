/**
 * @file src/interfaces/alibaba.js
 * @class Alibaba
 * @description Wrapper class for the Alibaba Cloud AI (Qwen) API.
 * @param {string} apiKey - The API key for the Alibaba DashScope API.
 */

const BaseInterface = require('./baseInterface.js');
const { alibabaApiKey } = require('../utils/loadApiKeysFromEnv.js');
const { getConfig, loadProviderConfig } = require('../utils/configManager.js');

const interfaceName = 'alibaba';

loadProviderConfig(interfaceName);
const config = getConfig();

class Alibaba extends BaseInterface {
  constructor(apiKey) {
    super(interfaceName, apiKey || alibabaApiKey, config[interfaceName].url);
  }

  /**
   * Builds the request body for the Alibaba DashScope API request.
   * @param {string} model - The model to use for the request.
   * @param {Array<object>} messages - An array of message objects.
   * @param {number} max_tokens - The maximum number of tokens for the response.
   * @param {object} options - Additional options for the API request.
   * @returns {object} The constructed request body.
   */
  buildRequestBody(model, messages, max_tokens, options) {
    return {
      model: model,
      input: {
        messages: messages
      },
      parameters: {
        max_tokens: max_tokens,
        ...options
      }
    };
  }

  /**
   * Parse models response for Alibaba DashScope format
   * @param {object} data - API response data
   * @returns {Array} Array of model objects
   */
  parseModelsResponse(data) {
    // Handle DashScope specific response format
    if (data.output && data.output.models && Array.isArray(data.output.models)) {
      return data.output.models.map(model => ({
        id: model.model_id || model.id,
        name: model.model_name || model.model_id || model.id,
        object: 'model',
        created: Date.now(),
        owned_by: 'alibaba'
      }));
    }
    return [];
  }

  /**
   * Adjust embedding prompt for Alibaba format
   * @param {string} prompt - The input prompt to adjust
   * @returns {object} The adjusted embedding prompt
   */
  adjustEmbeddingPrompt(prompt) {
    return {
      texts: [prompt]
    };
  }
}

module.exports = Alibaba;
