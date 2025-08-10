/**
 * @file test/simple/coze.test.js
 * @description Simple tests for the Coze conversational AI interface.
 */

const Coze = require('../../src/interfaces/coze.js');
const { cozeApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(Coze, cozeApiKey, 'Coze', simplePrompt);
