/**
 * @file test/simple/stepfun.test.js
 * @description Simple tests for the StepFun interface.
 */

const StepFun = require('../../src/interfaces/stepfun.js');
const { stepfunApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

runTests(StepFun, stepfunApiKey, 'StepFun', simplePrompt);
