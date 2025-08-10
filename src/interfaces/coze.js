/**
 * @file src/interfaces/coze.js
 * @class Coze
 * @description Wrapper class for the Coze API.
 * @param {string} apiKey - The API key for the Coze API.
 */

const BaseInterface = require('./baseInterface.js');
const { cozeApiKey } = require('../utils/loadApiKeysFromEnv.js');
const { getConfig, loadProviderConfig } = require('../utils/configManager.js');

const interfaceName = 'coze';

loadProviderConfig(interfaceName);
const config = getConfig();

class Coze extends BaseInterface {
  constructor(apiKey) {
    super(interfaceName, apiKey || cozeApiKey, config[interfaceName].url);
  }

  /**
   * Builds the request body for the Coze API request.
   * @param {string} model - The model to use for the request.
   * @param {Array<object>} messages - An array of message objects.
   * @param {number} max_tokens - The maximum number of tokens for the response.
   * @param {object} options - Additional options for the API request.
   * @returns {object} The constructed request body.
   */
  buildRequestBody(model, messages, max_tokens, options) {
    return {
      conversation_id: options.conversation_id || 'default',
      bot_id: model,
      user: options.user || 'default_user',
      query: messages[messages.length - 1].content,
      chat_history: messages.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content,
        content_type: 'text'
      })),
      stream: options.stream || false,
      ...options
    };
  }

  /**
   * Parse models response for Coze format
   * @param {object} data - API response data
   * @returns {Array} Array of model objects
   */
  parseModelsResponse(data) {
    // Handle Coze specific response format
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(model => ({
        id: model.bot_id || model.id,
        name: model.bot_name || model.name || model.bot_id || model.id,
        object: 'model',
        created: Date.now(),
        owned_by: 'coze'
      }));
    }
    return [];
  }

  /**
   * Detect model capabilities for Coze models
   * @param {object} model - Model information
   * @returns {object} Model capabilities
   */
  detectModelCapabilities(model) {
    const capabilities = super.detectModelCapabilities(model);
    
    // Coze bots are conversational by default
    capabilities.chat = true;
    capabilities.conversational = true;
    
    return capabilities;
  }
}

module.exports = Coze;
