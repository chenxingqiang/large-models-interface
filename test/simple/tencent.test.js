/**
 * @file test/simple/tencent.test.js
 * @description Simple tests for the Tencent Hunyuan interface.
 */

const Tencent = require('../../src/interfaces/tencent.js');
const { tencentApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(Tencent, tencentApiKey, 'Tencent', simplePrompt);
