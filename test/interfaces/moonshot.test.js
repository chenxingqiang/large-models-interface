/**
 * @file test/interfaces/moonshot.test.js
 * @description Tests for the Moonshot AI (Kimi) interface class.
 */

const Moonshot = require('../../src/interfaces/moonshot.js');
const { moonshotApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
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

runTests(Moonshot, moonshotApiKey, 'Moonshot', 'moonshot-v1-128k', message);
