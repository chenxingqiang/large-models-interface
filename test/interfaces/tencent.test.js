/**
 * @file test/interfaces/tencent.test.js
 * @description Tests for the Tencent Hunyuan interface class.
 */

const Tencent = require('../../src/interfaces/tencent.js');
const { tencentApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
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

runTests(Tencent, tencentApiKey, 'Tencent', 'hunyuan-pro', message);
