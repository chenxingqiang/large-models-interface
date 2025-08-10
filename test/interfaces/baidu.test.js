/**
 * @file test/interfaces/baidu.test.js
 * @description Tests for the Baidu ERNIE (Wenxin Workshop) interface class.
 */

const Baidu = require('../../src/interfaces/baidu.js');
const { baiduApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
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

runTests(Baidu, baiduApiKey, 'Baidu', 'ernie-4.0-8k', message);
