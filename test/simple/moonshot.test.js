/**
 * @file test/simple/moonshot.test.js
 * @description Simple tests for the Moonshot AI interface.
 */

const Moonshot = require('../../src/interfaces/moonshot.js');
const { moonshotApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(Moonshot, moonshotApiKey, 'Moonshot', simplePrompt);
