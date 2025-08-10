/**
 * @file test/utils/initializationMonitor.test.js
 * @description Unit tests for InitializationMonitor
 */

const initializationMonitor = require('../../src/utils/initializationMonitor');

// Mock interface for testing
class MockInterface {
  constructor(name, initState = {}) {
    this.interfaceName = name;
    this.initializationState = {
      status: 'initializing',
      progress: 0,
      message: 'Initializing...',
      modelsCount: 0,
      error: null,
      startTime: Date.now(),
      ...initState
    };
  }

  getInitializationState() {
    return { ...this.initializationState };
  }

  completeInitialization(modelsCount = 5) {
    this.initializationState = {
      ...this.initializationState,
      status: 'completed',
      progress: 100,
      modelsCount,
      message: `${this.interfaceName} completed`
    };
  }

  failInitialization(error = 'Test error') {
    this.initializationState = {
      ...this.initializationState,
      status: 'failed',
      progress: 100,
      error,
      message: `${this.interfaceName} failed`
    };
  }

  cacheInitialization(modelsCount = 3) {
    this.initializationState = {
      ...this.initializationState,
      status: 'cached',
      progress: 100,
      modelsCount,
      message: `${this.interfaceName} using cache`
    };
  }
}

describe('InitializationMonitor', () => {
  let mockConsoleLog;

  beforeEach(() => {
    // Reset monitor state
    initializationMonitor.reset();
    
    // Mock console.log
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  describe('Interface Registration', () => {
    test('should register interface and update global state', () => {
      const mockInterface = new MockInterface('test');
      
      initializationMonitor.registerInterface('test', mockInterface);
      
      expect(initializationMonitor.globalState.totalInterfaces).toBe(1);
      expect(initializationMonitor.interfaces.has('test')).toBe(true);
    });

    test('should handle multiple interface registrations', () => {
      const interfaces = [
        new MockInterface('openai'),
        new MockInterface('anthropic'),
        new MockInterface('groq')
      ];

      interfaces.forEach((iface, index) => {
        initializationMonitor.registerInterface(iface.interfaceName, iface);
      });

      expect(initializationMonitor.globalState.totalInterfaces).toBe(3);
      expect(initializationMonitor.interfaces.size).toBe(3);
    });
  });

  describe('Global State Management', () => {
    test('should update global state when all interfaces complete', () => {
      const openai = new MockInterface('openai');
      const anthropic = new MockInterface('anthropic');

      initializationMonitor.registerInterface('openai', openai);
      initializationMonitor.registerInterface('anthropic', anthropic);

      // Complete both interfaces
      openai.completeInitialization(10);
      anthropic.completeInitialization(8);

      initializationMonitor.updateGlobalState();

      expect(initializationMonitor.globalState.status).toBe('completed');
      expect(initializationMonitor.globalState.completedInterfaces).toBe(2);
      expect(initializationMonitor.globalState.totalModels).toBe(18);
    });

    test('should set partial status when some interfaces fail', () => {
      const openai = new MockInterface('openai');
      const anthropic = new MockInterface('anthropic');
      const groq = new MockInterface('groq');

      initializationMonitor.registerInterface('openai', openai);
      initializationMonitor.registerInterface('anthropic', anthropic);
      initializationMonitor.registerInterface('groq', groq);

      // Complete two, fail one
      openai.completeInitialization(10);
      anthropic.cacheInitialization(5);
      groq.failInitialization();

      initializationMonitor.updateGlobalState();

      expect(initializationMonitor.globalState.status).toBe('partial');
      expect(initializationMonitor.globalState.completedInterfaces).toBe(2);
      expect(initializationMonitor.globalState.failedInterfaces).toBe(1);
      expect(initializationMonitor.globalState.totalModels).toBe(15);
    });

    test('should set failed status when all interfaces fail', () => {
      const openai = new MockInterface('openai');
      const anthropic = new MockInterface('anthropic');

      initializationMonitor.registerInterface('openai', openai);
      initializationMonitor.registerInterface('anthropic', anthropic);

      // Fail both interfaces
      openai.failInitialization();
      anthropic.failInitialization();

      initializationMonitor.updateGlobalState();

      expect(initializationMonitor.globalState.status).toBe('failed');
      expect(initializationMonitor.globalState.completedInterfaces).toBe(0);
      expect(initializationMonitor.globalState.failedInterfaces).toBe(2);
    });

    test('should treat cached interfaces as completed', () => {
      const openai = new MockInterface('openai');
      
      initializationMonitor.registerInterface('openai', openai);
      openai.cacheInitialization(7);
      
      initializationMonitor.updateGlobalState();

      expect(initializationMonitor.globalState.status).toBe('completed');
      expect(initializationMonitor.globalState.completedInterfaces).toBe(1);
      expect(initializationMonitor.globalState.totalModels).toBe(7);
    });
  });

  describe('Progress Reporting', () => {
    test('should log completion message when all succeed', () => {
      const openai = new MockInterface('openai');
      initializationMonitor.registerInterface('openai', openai);
      
      openai.completeInitialization(15);
      initializationMonitor.updateGlobalState();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('All interfaces initialized')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('15 models')
      );
    });

    test('should log partial completion message', () => {
      const openai = new MockInterface('openai');
      const anthropic = new MockInterface('anthropic');
      
      initializationMonitor.registerInterface('openai', openai);
      initializationMonitor.registerInterface('anthropic', anthropic);
      
      openai.completeInitialization(10);
      anthropic.failInitialization();
      
      initializationMonitor.updateGlobalState();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Partial initialization')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('1/2 succeeded')
      );
    });

    test('should log failure message when all fail', () => {
      const openai = new MockInterface('openai');
      initializationMonitor.registerInterface('openai', openai);
      
      openai.failInitialization();
      initializationMonitor.updateGlobalState();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('All interface initialization failed')
      );
    });

    test('should log progress during initialization', () => {
      initializationMonitor.globalState.status = 'initializing';
      initializationMonitor.globalState.totalInterfaces = 3;
      initializationMonitor.globalState.completedInterfaces = 1;
      initializationMonitor.globalState.failedInterfaces = 1;
      
      initializationMonitor.reportProgress();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Initialization progress: 2/3')
      );
    });
  });

  describe('Detailed Reporting', () => {
    test('should provide detailed report with global and interface states', () => {
      const openai = new MockInterface('openai');
      const anthropic = new MockInterface('anthropic');

      initializationMonitor.registerInterface('openai', openai);
      initializationMonitor.registerInterface('anthropic', anthropic);

      openai.completeInitialization(12);
      anthropic.cacheInitialization(6);

      const report = initializationMonitor.getDetailedReport();

      expect(report).toHaveProperty('global');
      expect(report).toHaveProperty('interfaces');
      
      expect(report.global.totalInterfaces).toBe(2);
      expect(report.global.totalModels).toBe(18);
      
      expect(report.interfaces).toHaveProperty('openai');
      expect(report.interfaces).toHaveProperty('anthropic');
      expect(report.interfaces.openai.status).toBe('completed');
      expect(report.interfaces.anthropic.status).toBe('cached');
    });

    test('should include error information in detailed report', () => {
      const failed = new MockInterface('failed');
      initializationMonitor.registerInterface('failed', failed);
      
      failed.failInitialization('Network timeout');
      
      const report = initializationMonitor.getDetailedReport();
      
      expect(report.interfaces.failed.status).toBe('failed');
      expect(report.interfaces.failed.error).toBe('Network timeout');
    });
  });

  describe('Wait for Completion', () => {
    test('should resolve immediately when already completed', async () => {
      const openai = new MockInterface('openai');
      initializationMonitor.registerInterface('openai', openai);
      
      openai.completeInitialization(5);
      initializationMonitor.updateGlobalState();
      
      const report = await initializationMonitor.waitForAllInterfaces(1000);
      
      expect(report.global.status).toBe('completed');
    });

    test('should timeout if initialization takes too long', async () => {
      // Keep global state as initializing
      initializationMonitor.globalState.status = 'initializing';
      
      await expect(initializationMonitor.waitForAllInterfaces(100))
        .rejects.toThrow('Global initialization timeout: 100ms');
    });

    test('should resolve when initialization completes during wait', async () => {
      const openai = new MockInterface('openai');
      initializationMonitor.registerInterface('openai', openai);
      
      // Simulate async completion
      setTimeout(() => {
        openai.completeInitialization(8);
        initializationMonitor.updateGlobalState();
      }, 50);
      
      const report = await initializationMonitor.waitForAllInterfaces(200);
      
      expect(report.global.status).toBe('completed');
      expect(report.global.totalModels).toBe(8);
    });
  });

  describe('Monitor Reset', () => {
    test('should reset monitor state completely', () => {
      const openai = new MockInterface('openai');
      initializationMonitor.registerInterface('openai', openai);
      
      expect(initializationMonitor.interfaces.size).toBe(1);
      expect(initializationMonitor.globalState.totalInterfaces).toBe(1);
      
      initializationMonitor.reset();
      
      expect(initializationMonitor.interfaces.size).toBe(0);
      expect(initializationMonitor.globalState.totalInterfaces).toBe(0);
      expect(initializationMonitor.globalState.status).toBe('initializing');
    });

    test('should reset timestamps when resetting', () => {
      const originalTime = initializationMonitor.globalState.startTime;
      
      // Wait a bit
      setTimeout(() => {
        initializationMonitor.reset();
        expect(initializationMonitor.globalState.startTime).toBeGreaterThan(originalTime);
      }, 10);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty interfaces list', () => {
      initializationMonitor.updateGlobalState();
      
      expect(initializationMonitor.globalState.completedInterfaces).toBe(0);
      expect(initializationMonitor.globalState.failedInterfaces).toBe(0);
      expect(initializationMonitor.globalState.totalModels).toBe(0);
    });

    test('should handle interfaces with zero models', () => {
      const empty = new MockInterface('empty');
      initializationMonitor.registerInterface('empty', empty);
      
      empty.completeInitialization(0);
      initializationMonitor.updateGlobalState();
      
      expect(initializationMonitor.globalState.status).toBe('completed');
      expect(initializationMonitor.globalState.totalModels).toBe(0);
    });

    test('should handle interfaces with undefined modelsCount', () => {
      const undef = new MockInterface('undefined');
      undef.initializationState.modelsCount = undefined;
      
      initializationMonitor.registerInterface('undefined', undef);
      undef.initializationState.status = 'completed';
      
      initializationMonitor.updateGlobalState();
      
      expect(initializationMonitor.globalState.totalModels).toBe(0);
    });
  });
});
