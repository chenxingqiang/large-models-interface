# large-models-interface

[![Star on GitHub](https://img.shields.io/github/stars/chenxingqiang/large-models-interface?style=social)](https://github.com/chenxingqiang/large-models-interface/stargazers) [![Fork on GitHub](https://img.shields.io/github/forks/chenxingqiang/large-models-interface?style=social)](https://github.com/chenxingqiang/large-models-interface/network/members) [![Watch on GitHub](https://img.shields.io/github/watchers/chenxingqiang/large-models-interface?style=social)](https://github.com/chenxingqiang/large-models-interface/watchers)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Built with Node.js](https://img.shields.io/badge/Built%20with-Node.js-green)](https://nodejs.org/)

**Maintained by [chenxingqiang](https://github.com/chenxingqiang)**

## Introduction

**Large Models Interface** is a comprehensive npm module designed to streamline interactions with various AI model providers in your Node.js applications. Our mission is to provide a unified interface for **all types of large models**, making it simple to switch between providers and leverage the best models for your specific needs.

🎯 **Our Vision**: Universal access to all kinds of large AI models through a single, consistent interface.

🇨🇳 **Special Focus on Chinese AI Ecosystem**: We prioritize comprehensive support for leading Chinese AI providers including Baidu, Alibaba, ByteDance, Tencent, iFLYTEK, and emerging players, making this the most China-friendly international AI interface.

### 🚀 **Multi-Modal AI Support**

We are building the most comprehensive interface for modern AI models:

- **🗣️ Natural Language Models** - Chat completion, text generation, and language understanding
- **🖼️ Vision Models** - Image analysis, generation, and vision-language tasks  
- **🎵 Audio Models** - Speech recognition, synthesis, and audio processing
- **🎬 Video Models** - Video analysis, generation, and multimodal video understanding
- **🧠 Specialized Models** - Code generation, embeddings, and domain-specific AI

The Large Models Interface package currently offers comprehensive support for **51 language model providers and hundreds of models**, with active development to expand into all AI modalities. This extensive and growing coverage ensures maximum flexibility in choosing the best models for your applications.

## 🌟 **Current Support: 51 Providers & Hundreds of Models**

### 🗣️ **Natural Language Models (Current)**

#### 🌍 **Global Leading Providers**
**International**: OpenAI, Anthropic, Google Gemini, Mistral AI, Groq, DeepSeek, Hugging Face, NVIDIA AI, xAI, Coze, and 30+ more providers.

**Supported Global Providers**: AI21 Studio, AiLAYER, AIMLAPI, Anyscale, Anthropic, Cloudflare AI, Cohere, Corcel, Coze, DeepInfra, DeepSeek, Fireworks AI, Forefront AI, FriendliAI, Google Gemini, GooseAI, Groq, Hugging Face Inference, HyperBee AI, Lamini, LLaMA.CPP, Mistral AI, Monster API, Neets.ai, Novita AI, NVIDIA AI, OctoAI, Ollama, OpenAI, Perplexity AI, Reka AI, Replicate, Shuttle AI, SiliconFlow, TheB.ai, Together AI, Voyage AI, Watsonx AI, Writer, xAI, and Zhipu AI.

#### 🇨🇳 **Chinese AI Ecosystem**
**Leading Chinese Providers**: 百度文心一言 (Baidu ERNIE), 阿里通义千问 (Alibaba Qwen), 字节跳动豆包 (ByteDance Doubao), 讯飞星火 (iFLYTEK Spark), 智谱 ChatGLM, 腾讯混元 (Tencent Hunyuan), and more.

**Chinese Providers** (已支持/Currently Supported):
- **[百度文心一言系列模型](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html)** - Baidu ERNIE Series ✅
- **[阿里通义千问系列模型](https://help.aliyun.com/document_detail/2400395.html)** - Alibaba Qwen Series ✅ 
- **[字节跳动豆包大模型](https://www.volcengine.com/experience/ark)** - ByteDance Doubao (Volcano Engine) ✅
- **[讯飞星火认知大模型](https://www.xfyun.cn/doc/spark/Web.html)** - iFLYTEK Spark Cognitive Model ✅
- **[智谱 ChatGLM 系列模型](https://bigmodel.cn/)** - Zhipu ChatGLM Series ✅
- **[腾讯混元大模型](https://cloud.tencent.com/document/product/1729)** - Tencent Hunyuan ✅
- **[Moonshot AI](https://platform.moonshot.cn/)** - 月之暗面 ✅
- **[百川大模型](https://platform.baichuan-ai.com/)** - Baichuan AI ✅
- **[MINIMAX](https://api.minimax.chat/)** - MiniMax Models ✅
- **[零一万物](https://platform.lingyiwanwu.com/)** - 01.AI (Yi Series) ✅
- **[阶跃星辰](https://platform.stepfun.com/)** - StepFun ✅
- **[硅基流动 SiliconCloud](https://cloud.siliconflow.cn/)** - SiliconFlow ✅

### 🚧 **Coming Soon: Multi-Modal Expansion**

- **🖼️ Vision Models** - Image understanding, OCR, visual question answering
- **🎵 Audio Models** - Speech-to-text, text-to-speech, audio generation  
- **🎬 Video Models** - Video analysis, captioning, generation
- **🧠 Specialized Models** - Code completion, scientific computing, domain-specific AI

Our roadmap includes expanding across all AI modalities, with dynamic model discovery to automatically support the latest releases.

<!-- Support List -->

[![AI21 Studio](https://samestrin.github.io/media/large-models-interface/icons/ai21.png)](/docs/providers/ai21.md) [![AIMLAPI](https://samestrin.github.io/media/large-models-interface/icons/aimlapi.png)](/docs/providers/aimlapi.md) [![Anthropic](https://samestrin.github.io/media/large-models-interface/icons/anthropic.png)](/docs/providers/anthropic.md) [![Anyscale](https://samestrin.github.io/media/large-models-interface/icons/anyscale.png)](/docs/providers/anyscale.md) [![Cloudflare AI](https://samestrin.github.io/media/large-models-interface/icons/cloudflareai.png)](/docs/providers/cloudflareai.md) [![Cohere](https://samestrin.github.io/media/large-models-interface/icons/cohere.png)](/docs/providers/cohere.md) [![Corcel](https://samestrin.github.io/media/large-models-interface/icons/corcel.png)](/docs/providers/corcel.md) [![DeepInfra](https://samestrin.github.io/media/large-models-interface/icons/deepinfra.png)](/docs/providers/deepinfra.md) [![DeepSeek](https://samestrin.github.io/media/large-models-interface/icons/deepseek.png)](/docs/providers/deepseek.md) [![Forefront AI](https://samestrin.github.io/media/large-models-interface/icons/forefront.png)](/docs/providers/forefront.md) [![GooseAI](https://samestrin.github.io/media/large-models-interface/icons/gooseai.png)](/docs/providers/gooseai.md) [![Lamini](https://samestrin.github.io/media/large-models-interface/icons/lamini.png)](/docs/providers/lamini.md) [![Mistral AI](https://samestrin.github.io/media/large-models-interface/icons/mistralai.png)](/docs/providers/mistralai.md) [![Monster API](https://samestrin.github.io/media/large-models-interface/icons/monsterapi.png)](/docs/providers/monsterapi.md) [![Neets.ai](https://samestrin.github.io/media/large-models-interface/icons/neetsai.png)](/docs/providers/neetsai.md) [![Perplexity AI](https://samestrin.github.io/media/large-models-interface/icons/perplexity.png)](/docs/providers/perplexity.md) [![Reka AI](https://samestrin.github.io/media/large-models-interface/icons/rekaai.png)](/docs/providers/rekaai.md) [![Replicate](https://samestrin.github.io/media/large-models-interface/icons/replicate.png)](/docs/providers/replicate.md) [![Shuttle AI](https://samestrin.github.io/media/large-models-interface/icons/shuttleai.png)](/docs/providers/shuttleai.md) [![Together AI](https://samestrin.github.io/media/large-models-interface/icons/togetherai.png)](/docs/providers/togetherai.md) [![Writer](https://samestrin.github.io/media/large-models-interface/icons/writer.png)](/docs/providers/writer.md)

<!-- Support List End -->

[Detailed Provider List](docs/providers/README.md)

## ✨ **Core Features**

### 🎯 **Universal AI Interface**
- **Unified API**: `LLMInterface.sendMessage` provides a single, consistent interface to interact with **51 AI model providers**
- **Multi-Modal Ready**: Designed to support text, vision, audio, and video models through the same interface
- **Dynamic Model Discovery**: Automatically detects and supports newly released models without code updates
- **🇨🇳 China-First Design**: Comprehensive support for Chinese AI ecosystem with native language examples and documentation

### 🚀 **Advanced Capabilities**
- **Chat Completion & Streaming**: Full support for [chat completion, streaming, and embeddings](docs/providers/README.md) with intelligent failover
- **Smart Model Selection**: Automatically choose the best model based on task type and requirements
- **Response Caching**: Intelligent caching system to reduce costs and improve performance
- **Graceful Error Handling**: Robust retry mechanisms with exponential backoff

### 🔧 **Developer Experience**
- **Dynamic Module Loading**: Lazy loading of provider interfaces to minimize resource usage
- **JSON Output & Repair**: Native JSON output support with automatic repair for malformed responses
- **Extensible Architecture**: Easy integration of new providers and model types
- **Type Safety**: Full TypeScript support for better development experience

### 🌐 **Future-Ready Architecture**
- **Modality Expansion**: Built to seamlessly integrate vision, audio, and video models
- **Provider Agnostic**: Switch between providers without changing your application code
- **Auto-Discovery**: Continuously updated model registry for the latest AI capabilities

## Dependencies

The project relies on several npm packages and APIs. Here are the primary dependencies:

- `axios`: For making HTTP requests (used for various HTTP AI APIs).
- `@google/generative-ai`: SDK for interacting with the Google Gemini API.
- `dotenv`: For managing environment variables. Used by test cases.
- `jsonrepair`: Used to repair invalid JSON responses.
- `loglevel`: A minimal, lightweight logging library with level-based logging and filtering.

The following optional packages can added to extend LLMInterface's caching capabilities:

- `flat-cache`: A simple JSON based cache.
- `cache-manager`: An extendible cache module that supports various backends including Redis, MongoDB, File System, Memcached, Sqlite, and more.

## Installation

To install the LLM Interface npm module, you can use npm:

```bash
npm install large-models-interface
```

## Quick Start

- Looking for [API Keys](/docs/api-keys.md)? This document provides helpful links.
- Detailed [usage](/docs/usage.md) documentation is available here.
- Various [examples](/examples) are also available to help you get started.
- A breakdown of [model aliases](/docs/models.md) is available here.
- A breakdown of [embeddings model aliases](/docs/embeddings.md) is available here.
- If you still want more examples, you may wish to review the [test cases](/test/) for further examples.

## Usage

First import `LLMInterface`. You can do this using either the CommonJS `require` syntax:

```javascript
const { LLMInterface } = require('large-models-interface');
```

### 🌍 **Global Providers Example**

```javascript
LLMInterface.setApiKey({ openai: process.env.OPENAI_API_KEY });

try {
  const response = await LLMInterface.sendMessage(
    'openai',
    'Explain the importance of low latency LLMs.',
  );
} catch (error) {
  console.error(error);
}
```

### 🇨🇳 **Chinese Providers Example**

```javascript
// 智谱 ChatGLM
LLMInterface.setApiKey({ zhipuai: process.env.ZHIPUAI_API_KEY });

const response = await LLMInterface.sendMessage(
  'zhipuai',
  '请解释大语言模型在中文自然语言处理中的重要性',
  { model: 'glm-4' }
);

// 百度文心一言
LLMInterface.setApiKey({ baidu: process.env.BAIDU_API_KEY });

const response = await LLMInterface.sendMessage(
  'baidu',
  '请帮我写一段关于人工智能发展的文章',
  { model: 'ernie-4.0-8k' }
);

// 阿里通义千问
LLMInterface.setApiKey({ alibaba: process.env.ALIBABA_API_KEY });

const response = await LLMInterface.sendMessage(
  'alibaba',
  '请介绍一下人工智能的发展历程',
  { model: 'qwen-turbo' }
);
```

if you prefer, you can pass use a one-liner to pass the provider and API key, essentially skipping the LLMInterface.setApiKey() step.

```javascript
const response = await LLMInterface.sendMessage(
  ['openai', process.env.OPENAI_API_KEY],
  'Explain the importance of low latency LLMs.',
);
```

Passing a more complex message object is just as simple. The same rules apply:

```javascript
const message = {
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain the importance of low latency LLMs.' },
  ],
};

try {
  const response = await LLMInterface.sendMessage('openai', message, {
    max_tokens: 150,
  });
} catch (error) {
  console.error(error);
}
```

_LLMInterfaceSendMessage and LLMInterfaceStreamMessage are still available and will be available until version 3_

## Running Tests

The project includes tests for each LLM handler. To run the tests, use the following command:

```bash
npm test
```

The comprehensive test suite covers all 51 providers with proper API key validation and graceful skipping when credentials are not available.

## 🗓️ **Roadmap**

### ✅ **Phase 1: Enhanced Language Models** (Completed)
- [x] **Dynamic Model Discovery** - Auto-detect latest models from all providers
- [x] **Chinese AI Providers Integration**:
  - [x] **百度文心一言 (Baidu ERNIE)** - ERNIE-4.0, ERNIE-3.5 series
  - [x] **阿里通义千问 (Alibaba Qwen)** - Qwen2.5, Qwen-Turbo, Qwen-Plus
  - [x] **字节跳动豆包 (ByteDance Doubao)** - Doubao-pro, Doubao-lite series
  - [x] **讯飞星火 (iFLYTEK Spark)** - Spark-4.0, Spark-3.5 models
  - [x] **腾讯混元 (Tencent Hunyuan)** - Hunyuan-large, Hunyuan-pro
  - [x] **月之暗面 (Moonshot AI)** - Moonshot-v1 series
  - [x] **百川大模型 (Baichuan AI)** - Baichuan2 series
  - [x] **零一万物 (01.AI)** - Yi-34B, Yi-6B series
  - [x] **阶跃星辰 (StepFun)** - Step-1V, Step-2 models
- [x] **New Global Providers** - xAI Grok, SiliconFlow, Coze
- [x] **Enhanced Embeddings** - Voyage AI, improved embedding support

### 🖼️ **Phase 2: Vision Models** (Next)
- [ ] **Image Understanding** - GPT-4V, Claude Vision, Gemini Vision
- [ ] **Image Generation** - DALL-E, Midjourney, Stable Diffusion
- [ ] **OCR & Document AI** - Advanced document processing capabilities
- [ ] **Visual Question Answering** - Multi-modal reasoning

### 🎵 **Phase 3: Audio Models** (Future)
- [ ] **Speech Recognition** - Whisper, Azure Speech, Google Speech-to-Text
- [ ] **Text-to-Speech** - ElevenLabs, Azure TTS, OpenAI TTS
- [ ] **Audio Generation** - Music generation, sound effects
- [ ] **Real-time Audio** - Streaming audio processing

### 🎬 **Phase 4: Video & Advanced AI** (Future)
- [ ] **Video Understanding** - Video analysis, captioning, content moderation
- [ ] **Video Generation** - AI video creation and editing
- [ ] **Multi-modal Reasoning** - Cross-modal understanding and generation
- [ ] **Specialized AI** - Scientific computing, code generation, domain-specific models

_🚀 Submit your feature requests and suggestions!_

## Contribute

Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes or improvements.

## Acknowledgments

This project is based on and extends the excellent [llm-interface](https://github.com/samestrin/llm-interface) project. We thank the original authors for their foundational work.

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.

**Author:** chenxingqiang  
**GitHub:** [chenxingqiang](https://github.com/chenxingqiang)

## Blogs

- [Comparing 13 LLM Providers API Performance with Node.js: Latency and Response Times Across Models](https://dev.to/samestrin/comparing-13-llm-providers-api-performance-with-nodejs-latency-and-response-times-across-models-2ka4)

## Share

[![Twitter](https://img.shields.io/badge/X-Tweet-blue)](https://twitter.com/intent/tweet?text=Check%20out%20this%20awesome%20project!&url=https://github.com/chenxingqiang/large-models-interface) [![Facebook](https://img.shields.io/badge/Facebook-Share-blue)](https://www.facebook.com/sharer/sharer.php?u=https://github.com/chenxingqiang/large-models-interface) [![LinkedIn](https://img.shields.io/badge/LinkedIn-Share-blue)](https://www.linkedin.com/sharing/share-offsite/?url=https://github.com/chenxingqiang/large-models-interface)
