/**
 * @file test/interfaces/minimax.test.js
 * @description Tests for the MINIMAX AI interface class.
 */

const MINIMAX = require('../../src/interfaces/minimax.js');
const { minimaxApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
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

runTests(MINIMAX, minimaxApiKey, 'MINIMAX', 'abab6.5-chat', message);
