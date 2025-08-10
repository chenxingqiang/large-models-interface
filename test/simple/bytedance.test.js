/**
 * @file test/simple/bytedance.test.js
 * @description Simple tests for the ByteDance Doubao interface.
 */

const ByteDance = require('../../src/interfaces/bytedance.js');
const { bytedanceApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(ByteDance, bytedanceApiKey, 'ByteDance', simplePrompt);
