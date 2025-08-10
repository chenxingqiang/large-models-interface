/**
 * @file test/interfaces/xai.test.js
 * @description Tests for the xAI (Grok) interface class.
 */

const xAI = require('../../src/interfaces/xai.js');
const { xaiApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
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

runTests(xAI, xaiApiKey, 'xAI', 'grok-beta', message);
