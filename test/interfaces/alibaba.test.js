/**
 * @file test/interfaces/alibaba.test.js
 * @description Tests for the Alibaba Cloud AI (Qwen) interface class.
 */

const Alibaba = require('../../src/interfaces/alibaba.js');
const { alibabaApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
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

runTests(Alibaba, alibabaApiKey, 'Alibaba', 'qwen-turbo', message);
