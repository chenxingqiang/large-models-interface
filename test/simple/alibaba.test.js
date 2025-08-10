/**
 * @file test/simple/alibaba.test.js
 * @description Simple tests for the Alibaba Cloud AI interface.
 */

const Alibaba = require('../../src/interfaces/alibaba.js');
const { alibabaApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(Alibaba, alibabaApiKey, 'Alibaba', simplePrompt);
