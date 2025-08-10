/**
 * @file test/interfaces/bytedance.test.js
 * @description Tests for the ByteDance Doubao (Volcano Engine) interface class.
 */

const ByteDance = require('../../src/interfaces/bytedance.js');
const { bytedanceApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

const message = {
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant.',
    },
    {
      role: 'user',
      content: simplePrompt,
    },
  ],
};

runTests(ByteDance, bytedanceApiKey, 'ByteDance', 'doubao-pro-32k', message);
