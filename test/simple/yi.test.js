/**
 * @file test/simple/yi.test.js
 * @description Simple tests for the 01.AI Yi interface.
 */

const Yi = require('../../src/interfaces/yi.js');
const { yiApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(Yi, yiApiKey, 'Yi', simplePrompt);
