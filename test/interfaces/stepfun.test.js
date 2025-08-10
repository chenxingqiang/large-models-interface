/**
 * @file test/interfaces/stepfun.test.js
 * @description Tests for the StepFun (阶跃星辰) interface class.
 */

const StepFun = require('../../src/interfaces/stepfun.js');
const { stepfunApiKey } = require('../../src/utils/loadApiKeysFromEnv.js');
const { simplePrompt } = require('../../src/utils/defaults.js');
const runTests = require('./sharedTestCases.js');

const message = {
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant.',
    },
    {
      role: 'user',
      content: simplePrompt,
    },
  ],
};

runTests(StepFun, stepfunApiKey, 'StepFun', 'step-1v-32k', message);
