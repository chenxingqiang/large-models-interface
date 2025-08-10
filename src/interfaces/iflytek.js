/**
 * @file src/interfaces/iflytek.js
 * @class iFLYTEK
 * @description Wrapper class for the iFLYTEK Spark API.
 * @param {string} apiKey - The API key for the iFLYTEK Spark API.
 */

const BaseInterface = require('./baseInterface.js');
const { iflytekApiKey } = require('../utils/loadApiKeysFromEnv.js');
const { getConfig, loadProviderConfig } = require('../utils/configManager.js');

const interfaceName = 'iflytek';

loadProviderConfig(interfaceName);
const config = getConfig();

class iFLYTEK extends BaseInterface {
  constructor(apiKey) {
    super(interfaceName, apiKey || iflytekApiKey, config[interfaceName].url);
  }

  /**
   * Builds the request body for the iFLYTEK Spark API request.
   * @param {string} model - The model to use for the request.
   * @param {Array<object>} messages - An array of message objects.
   * @param {number} max_tokens - The maximum number of tokens for the response.
   * @param {object} options - Additional options for the API request.
   * @returns {object} The constructed request body.
   */
  buildRequestBody(model, messages, max_tokens, options) {
    return {
      header: {
        app_id: this.apiKey, // iFLYTEK uses app_id instead of API key
        uid: options.uid || 'default_user'
      },
      parameter: {
        chat: {
          domain: model,
          temperature: options.temperature || 0.7,
          max_tokens: max_tokens,
          top_k: options.top_k || 4,
          chat_id: options.chat_id || 'default'
        }
      },
      payload: {
        message: {
          text: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }
      }
    };
  }

  /**
   * Parse models response for iFLYTEK Spark format
   * @param {object} data - API response data
   * @returns {Array} Array of model objects
   */
  parseModelsResponse(data) {
    // Handle iFLYTEK specific response format
    if (data.payload && data.payload.choices && data.payload.choices.text) {
      // iFLYTEK has domain-based models
      const domains = ['general', 'generalv2', 'generalv3', 'generalv3.5'];
      return domains.map(domain => ({
        id: `spark-${domain}`,
        name: `Spark ${domain}`,
        object: 'model',
        created: Date.now(),
        owned_by: 'iflytek'
      }));
    }
    return [];
  }

  /**
   * Detect model capabilities for iFLYTEK models
   * @param {object} model - Model information
   * @returns {object} Model capabilities
   */
  detectModelCapabilities(model) {
    const capabilities = super.detectModelCapabilities(model);
    
    const name = (model.name || '').toLowerCase();
    // iFLYTEK Spark models support audio
    if (name.includes('spark')) {
      capabilities.chat = true;
      capabilities.audio = true;
    }
    
    return capabilities;
  }
}

module.exports = iFLYTEK;
