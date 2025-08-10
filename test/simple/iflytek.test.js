/**
 * @file test/simple/iflytek.test.js
 * @description Simple tests for the iFLYTEK Spark interface.
 */

const iFLYTEK = require('../../src/interfaces/iflytek.js');
const { iflytekApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(iFLYTEK, iflytekApiKey, 'iFLYTEK', simplePrompt);
