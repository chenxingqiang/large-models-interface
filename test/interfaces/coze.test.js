/**
 * @file test/interfaces/coze.test.js
 * @description Tests for the Coze conversational AI interface class.
 */

const Coze = require('../../src/interfaces/coze.js');
const { cozeApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

const message = {
  messages: [
    {
      role: 'user',
      content: simplePrompt,
    },
  ],
};

runTests(Coze, cozeApiKey, 'Coze', 'coze-bot-default', message, false);
