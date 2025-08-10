/**
 * @file test/interfaces/iflytek.test.js
 * @description Tests for the iFLYTEK Spark interface class.
 */

const iFLYTEK = require('../../src/interfaces/iflytek.js');
const { iflytekApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
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

runTests(iFLYTEK, iflytekApiKey, 'iFLYTEK', 'spark-pro-128k', message);
