# Provider Model Endpoint Mapping System

## Overview

The provider mapping system provides centralized management of AI provider model discovery endpoints, enabling automatic model detection and configuration updates across all supported providers.

## Architecture

### Core Components

1. **Central Mapping File**: `src/config/providerModelEndpoints.json`
   - Centralized database of all provider endpoints
   - Metadata, categories, and feature mappings
   - Rate limits and authentication information

2. **Provider Endpoint Manager**: `src/utils/providerEndpointManager.js`
   - JavaScript utility for managing provider endpoints
   - CRUD operations on provider configurations
   - Validation and statistics

3. **Configuration Updater**: `scripts/updateProviderEndpoints.js`
   - Automated script to update provider configs
   - Validation and reporting tools
   - Bulk update capabilities

## Central Mapping File Structure

```json
{
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2024-01-15T00:00:00Z",
    "description": "Centralized mapping of AI providers to their model list endpoints",
    "totalProviders": 38
  },
  "providers": {
    "openai": {
      "name": "OpenAI",
      "website": "https://openai.com",
      "apiDocs": "https://platform.openai.com/docs/api-reference",
      "modelsEndpoint": "https://api.openai.com/v1/models",
      "authType": "bearer",
      "status": "active",
      "supportedFeatures": ["chat", "embeddings", "vision", "audio", "tts"],
      "rateLimits": {
        "models": "unlimited",
        "requests": "10000/min"
      }
    }
  },
  "categories": {
    "global": ["openai", "anthropic", "google"],
    "chinese": ["zhipuai", "moonshot", "baidu"],
    "opensource": ["huggingface", "ollama"],
    "local": ["ollama", "llamacpp"]
  },
  "features": {
    "chat": ["openai", "anthropic", "groq"],
    "vision": ["openai", "google", "zhipuai"],
    "audio": ["openai", "alibaba"],
    "embeddings": ["openai", "cohere", "voyage"]
  }
}
```

## Usage Examples

### Using Provider Endpoint Manager

```javascript
const providerEndpointManager = require('./src/utils/providerEndpointManager');

// Get model endpoint for a provider
const endpoint = await providerEndpointManager.getModelEndpoint('openai');
console.log(endpoint); // "https://api.openai.com/v1/models"

// Get providers by category
const chineseProviders = await providerEndpointManager.getProvidersByCategory('chinese');
console.log(chineseProviders); // ["zhipuai", "moonshot", "baidu", ...]

// Get providers supporting specific features
const visionProviders = await providerEndpointManager.getProvidersByFeature('vision');
console.log(visionProviders); // ["openai", "google", "zhipuai", ...]

// Get provider statistics
const stats = await providerEndpointManager.getProviderStats();
console.log(stats);
// {
//   total: 38,
//   active: 35,
//   local: 2,
//   byFeature: { chat: 25, vision: 8, audio: 3 },
//   byCategory: { global: 5, chinese: 11, opensource: 5 }
// }
```

### Using Configuration Updater Script

```bash
# Update all provider configurations
node scripts/updateProviderEndpoints.js update

# Validate configurations
node scripts/updateProviderEndpoints.js validate

# Generate report
node scripts/updateProviderEndpoints.js report

# Run all operations
node scripts/updateProviderEndpoints.js all
```

### Integration with Model Discovery

The mapping system integrates seamlessly with the enhanced BaseInterface model discovery:

```javascript
const BaseInterface = require('./src/interfaces/baseInterface');

class OpenAIInterface extends BaseInterface {
  constructor() {
    super('openai', apiKey, baseURL);
    // modelsEndpoint automatically loaded from central mapping
    // and added to config during provider config update
  }
}

// Automatic model discovery uses the centrally managed endpoint
const openai = new OpenAIInterface();
const models = await openai.getAvailableModels();
console.log(`Discovered ${models.length} OpenAI models`);
```

## Provider Categories

### Global Providers
- **OpenAI**: GPT models, DALL-E, Whisper
- **Anthropic**: Claude models
- **Google**: Gemini models
- **Cohere**: Command and embedding models
- **Mistral AI**: Mistral and Mixtral models

### Chinese Providers (中文大模型)
- **智谱AI (Zhipu AI)**: GLM models
- **月之暗面 (Moonshot AI)**: Kimi models
- **百度智能云 (Baidu AI)**: ERNIE models
- **阿里云 (Alibaba)**: Qwen models
- **字节跳动 (ByteDance)**: Doubao models
- **腾讯云 (Tencent)**: Hunyuan models
- **科大讯飞 (iFLYTEK)**: Spark models
- **百川智能 (Baichuan)**: Baichuan models
- **阶跃星辰 (StepFun)**: Step models
- **零一万物 (01.AI)**: Yi models

### Open Source Providers
- **Hugging Face**: Transformers models
- **Replicate**: Open source model hosting
- **Together AI**: Open source LLMs
- **Ollama**: Local model runner
- **LLaMA.cpp**: Local LLaMA models

### Specialized Providers
- **Voyage AI**: Embedding specialists
- **NVIDIA AI**: Enterprise AI models
- **Cloudflare Workers AI**: Edge computing
- **IBM Watson AI**: Enterprise solutions

## Supported Features

### Model Capabilities
- **Chat**: Conversational text generation
- **Vision**: Image understanding and analysis
- **Audio**: Speech-to-text, text-to-speech
- **Embeddings**: Vector representations
- **Image Generation**: Text-to-image creation
- **Code**: Code generation and completion

### Authentication Types
- **Bearer Token**: Standard API key authentication
- **API Key**: Custom header authentication
- **Access Token**: OAuth-style tokens
- **Signature**: Signed request authentication
- **None**: No authentication (local models)

## Maintenance

### Adding New Providers

1. **Add to Central Mapping**:
```javascript
await providerEndpointManager.addProvider('newprovider', {
  name: 'New Provider',
  website: 'https://newprovider.com',
  apiDocs: 'https://docs.newprovider.com',
  modelsEndpoint: 'https://api.newprovider.com/v1/models',
  authType: 'bearer',
  status: 'active',
  supportedFeatures: ['chat', 'embeddings'],
  rateLimits: {
    models: 'unlimited',
    requests: '1000/min'
  }
});
```

2. **Update Provider Categories** (edit central mapping):
```json
{
  "categories": {
    "emerging": ["newprovider", "groq", "fireworksai"]
  }
}
```

3. **Update Configurations**:
```bash
node scripts/updateProviderEndpoints.js update
```

### Updating Existing Providers

```javascript
await providerEndpointManager.updateProviderEndpoint('existingprovider', {
  modelsEndpoint: 'https://api.existingprovider.com/v2/models',
  supportedFeatures: ['chat', 'vision', 'audio'],
  rateLimits: {
    requests: '2000/min'
  }
});
```

### Validation and Monitoring

```javascript
// Validate all endpoints are accessible
const validation = await providerEndpointManager.validateProviderEndpoints();
console.log(`${validation.accessible}/${validation.validated} endpoints accessible`);

// Export configurations for backup
await providerEndpointManager.exportProviderEndpoints('json', './backup.json');
await providerEndpointManager.exportProviderEndpoints('csv', './providers.csv');
```

## Benefits

### Centralized Management
- Single source of truth for all provider endpoints
- Consistent configuration across all providers
- Easy bulk updates and maintenance

### Automatic Discovery
- Dynamic model detection without manual updates
- Automatic integration with new models
- Fallback to cached data when APIs are unavailable

### Scalability
- Easy addition of new providers
- Categorization and feature-based filtering
- Bulk operations and validation

### Reliability
- Endpoint validation and health checking
- Multiple export formats for backup
- Graceful degradation when endpoints fail

## Future Enhancements

1. **Real-time Monitoring**: Monitor endpoint health and model availability
2. **Rate Limit Enforcement**: Automatic rate limiting based on provider specs
3. **Model Versioning**: Track model version changes and deprecations
4. **Cost Tracking**: Monitor usage costs across providers
5. **Performance Metrics**: Track response times and success rates
6. **Webhook Integration**: Automatic notifications for new models or changes

This system provides a robust foundation for managing the growing ecosystem of AI model providers while maintaining simplicity and reliability for end users.
