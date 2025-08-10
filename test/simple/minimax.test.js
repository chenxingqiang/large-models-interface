/**
 * @file test/simple/minimax.test.js
 * @description Simple tests for the MINIMAX AI interface.
 */

const MINIMAX = require('../../src/interfaces/minimax.js');
const { minimaxApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(MINIMAX, minimaxApiKey, 'MINIMAX', simplePrompt);
