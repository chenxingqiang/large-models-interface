/**
 * @file test/simple/xai.test.js
 * @description Simple tests for the xAI Grok interface.
 */

const xAI = require('../../src/interfaces/xai.js');
const { xaiApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(xAI, xaiApiKey, 'xAI', simplePrompt);
