/**
 * @file src/utils/initializationMonitor.js
 * @class InitializationMonitor
 * @description Global monitor for tracking model discovery initialization across all interfaces
 */

class InitializationMonitor {
  constructor() {
    this.interfaces = new Map();
    this.globalState = {
      status: 'initializing', // initializing, completed, partial, failed
      totalInterfaces: 0,
      completedInterfaces: 0,
      failedInterfaces: 0,
      startTime: Date.now(),
      totalModels: 0
    };
  }

  /**
   * Register an interface for monitoring
   * @param {string} interfaceName - Name of the interface
   * @param {object} interfaceInstance - Interface instance to monitor
   */
  registerInterface(interfaceName, interfaceInstance) {
    this.interfaces.set(interfaceName, interfaceInstance);
    this.globalState.totalInterfaces++;
    
    // Start monitoring this interface's status
    this.monitorInterface(interfaceName, interfaceInstance);
  }

  /**
   * Monitor a single interface's initialization status
   * @param {string} interfaceName - Name of the interface
   * @param {object} interfaceInstance - Interface instance
   */
  async monitorInterface(interfaceName, interfaceInstance) {
    while (interfaceInstance.initializationState.status === 'initializing') {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.updateGlobalState();
    }
    
    // Final state update
    this.updateGlobalState();
  }

  /**
   * Update global state based on all interface states
   */
  updateGlobalState() {
    let completed = 0;
    let failed = 0;
    let totalModels = 0;

    for (const [name, interface_] of this.interfaces) {
      const state = interface_.initializationState;
      
      if (state.status === 'completed' || state.status === 'cached') {
        completed++;
        totalModels += state.modelsCount || 0;
      } else if (state.status === 'failed') {
        failed++;
      }
    }

    this.globalState.completedInterfaces = completed;
    this.globalState.failedInterfaces = failed;
    this.globalState.totalModels = totalModels;

    // Determine global status
    if (completed + failed === this.globalState.totalInterfaces) {
      if (failed === 0) {
        this.globalState.status = 'completed';
      } else if (completed > 0) {
        this.globalState.status = 'partial';
      } else {
        this.globalState.status = 'failed';
      }
    }

    // Output progress report
    this.reportProgress();
  }

  /**
   * Output progress report to console
   */
  reportProgress() {
    const { totalInterfaces, completedInterfaces, failedInterfaces, totalModels } = this.globalState;
    const duration = Date.now() - this.globalState.startTime;
    
    if (this.globalState.status === 'completed') {
      console.log(`🎉 All interfaces initialized! Total discovered ${totalModels} models (${duration}ms)`);
      console.log(`✅ Success: ${completedInterfaces}/${totalInterfaces} interfaces`);
    } else if (this.globalState.status === 'partial') {
      console.log(`⚠️ Partial initialization: ${completedInterfaces}/${totalInterfaces} succeeded, ${failedInterfaces} failed`);
      console.log(`📊 Discovered ${totalModels} available models`);
    } else if (this.globalState.status === 'failed') {
      console.log(`❌ All interface initialization failed, using static config`);
    } else {
      console.log(`🔄 Initialization progress: ${completedInterfaces + failedInterfaces}/${totalInterfaces} (${Math.round(duration/1000)}s)`);
    }
  }

  /**
   * Get detailed status report for all interfaces
   * @returns {object} Detailed report with global and per-interface states
   */
  getDetailedReport() {
    const report = {
      global: this.globalState,
      interfaces: {}
    };

    for (const [name, interface_] of this.interfaces) {
      report.interfaces[name] = interface_.getInitializationState();
    }

    return report;
  }

  /**
   * Wait for all interfaces to complete initialization
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<object>} Final detailed report
   */
  async waitForAllInterfaces(timeout = 30000) {
    const startTime = Date.now();
    
    while (this.globalState.status === 'initializing') {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Global initialization timeout: ${timeout}ms`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return this.getDetailedReport();
  }

  /**
   * Reset the monitor state (useful for testing)
   */
  reset() {
    this.interfaces.clear();
    this.globalState = {
      status: 'initializing',
      totalInterfaces: 0,
      completedInterfaces: 0,
      failedInterfaces: 0,
      startTime: Date.now(),
      totalModels: 0
    };
  }
}

// Export singleton instance
const initializationMonitor = new InitializationMonitor();
module.exports = initializationMonitor;
