/**
 * @file test/simple/baidu.test.js
 * @description Simple tests for the Baidu ERNIE interface.
 */

const Baidu = require('../../src/interfaces/baidu.js');
const { baiduApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(Baidu, baiduApiKey, 'Baidu', simplePrompt);
