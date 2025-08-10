/**
 * @file test/interfaces/yi.test.js
 * @description Tests for the 01.AI (零一万物) Yi interface class.
 */

const Yi = require('../../src/interfaces/yi.js');
const { yiApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
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

runTests(Yi, yiApiKey, 'Yi', 'yi-large', message);
