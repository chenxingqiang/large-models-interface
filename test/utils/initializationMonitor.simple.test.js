/**
 * @file test/utils/initializationMonitor.simple.test.js
 * @description Simple unit tests for InitializationMonitor
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

describe('InitializationMonitor - Basic Tests', () => {
  beforeEach(() => {
    // Reset monitor state
    initializationMonitor.reset();
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

      interfaces.forEach((iface) => {
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

  describe('Interface State Tracking', () => {
    test('should track interface state changes correctly', () => {
      const interface1 = new MockInterface('test1');
      const interface2 = new MockInterface('test2');
      
      initializationMonitor.registerInterface('test1', interface1);
      initializationMonitor.registerInterface('test2', interface2);
      
      // Initially both initializing
      expect(initializationMonitor.globalState.status).toBe('initializing');
      
      // Complete one
      interface1.completeInitialization(5);
      initializationMonitor.updateGlobalState();
      expect(initializationMonitor.globalState.status).toBe('initializing');
      
      // Complete second
      interface2.completeInitialization(3);
      initializationMonitor.updateGlobalState();
      expect(initializationMonitor.globalState.status).toBe('completed');
    });

    test('should correctly calculate model counts', () => {
      const interfaces = [
        new MockInterface('provider1'),
        new MockInterface('provider2'),
        new MockInterface('provider3')
      ];

      interfaces.forEach((iface, index) => {
        initializationMonitor.registerInterface(`provider${index + 1}`, iface);
        iface.completeInitialization(10 + index * 5);
      });

      initializationMonitor.updateGlobalState();

      expect(initializationMonitor.globalState.totalModels).toBe(45); // 10 + 15 + 20
    });
  });
});
