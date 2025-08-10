/**
 * @file test/interfaces/baichuan.test.js
 * @description Tests for the Baichuan AI interface class.
 */

const Baichuan = require('../../src/interfaces/baichuan.js');
const { baichuanApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
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

runTests(Baichuan, baichuanApiKey, 'Baichuan', 'baichuan2-53b', message);
