/**
 * @file src/interfaces/baidu.js
 * @class Baidu
 * @description Wrapper class for the Baidu Wenxin Workshop (ERNIE) API.
 * @param {string} apiKey - The API key for the Baidu ERNIE API.
 */

const BaseInterface = require('./baseInterface.js');
const { baiduApiKey } = require('../utils/loadApiKeysFromEnv.js');
const { getConfig, loadProviderConfig } = require('../utils/configManager.js');

const interfaceName = 'baidu';

loadProviderConfig(interfaceName);
const config = getConfig();

class Baidu extends BaseInterface {
  constructor(apiKey) {
    super(interfaceName, apiKey || baiduApiKey, config[interfaceName].url);
  }

  /**
   * Builds the request body for the Baidu ERNIE API request.
   * @param {string} model - The model to use for the request.
   * @param {Array<object>} messages - An array of message objects.
   * @param {number} max_tokens - The maximum number of tokens for the response.
   * @param {object} options - Additional options for the API request.
   * @returns {object} The constructed request body.
   */
  buildRequestBody(model, messages, max_tokens, options) {
    return {
      messages: messages,
      max_output_tokens: max_tokens,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 0.9,
      penalty_score: options.penalty_score || 1.0,
      stream: options.stream || false,
      ...options
    };
  }

  /**
   * Get the request URL for Baidu ERNIE API
   * @param {string} model - The model to use for the request
   * @returns {string} The request URL
   */
  getRequestUrl(model) {
    // Baidu uses access_token in URL parameters
    const accessToken = this.apiKey;
    return `?access_token=${accessToken}`;
  }

  /**
   * Parse models response for Baidu ERNIE format
   * @param {object} data - API response data
   * @returns {Array} Array of model objects
   */
  parseModelsResponse(data) {
    // Handle Baidu specific response format
    if (data.result && data.result.data && Array.isArray(data.result.data)) {
      return data.result.data.map(model => ({
        id: model.id || model.name,
        name: model.name || model.id,
        object: 'model',
        created: Date.now(),
        owned_by: 'baidu'
      }));
    }
    return [];
  }

  /**
   * Adjust embedding prompt for Baidu format
   * @param {string} prompt - The input prompt to adjust
   * @returns {Array} The adjusted embedding prompt
   */
  adjustEmbeddingPrompt(prompt) {
    return [prompt];
  }
}

module.exports = Baidu;
