/**
 * @file test/simple/baichuan.test.js
 * @description Simple tests for the Baichuan AI interface.
 */

const Baichuan = require('../../src/interfaces/baichuan.js');
const { baichuanApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(Baichuan, baichuanApiKey, 'Baichuan', simplePrompt);
