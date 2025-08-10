#!/usr/bin/env node

/**
 * @file scripts/updateProviderEndpoints.js
 * @description Script to automatically update provider config files with model endpoints from central mapping
 */

const fs = require('fs').promises;
const path = require('path');
const providerEndpointManager = require('../src/utils/providerEndpointManager');

class ProviderConfigUpdater {
  constructor() {
    this.configDir = path.join(__dirname, '../src/config/providers');
  }

  /**
   * Update all provider config files with endpoints from central mapping
   */
  async updateAllProviderConfigs() {
    console.log('🚀 Starting provider configuration update...');
    
    try {
      const activeProviders = await providerEndpointManager.getActiveProviders();
      let updated = 0;
      let skipped = 0;
      let errors = 0;

      for (const providerName of activeProviders) {
        try {
          const wasUpdated = await this.updateProviderConfig(providerName);
          if (wasUpdated) updated++;
          else skipped++;
        } catch (error) {
          console.error(`❌ Failed to update ${providerName}: ${error.message}`);
          errors++;
        }
      }

      console.log('\n📊 Update Summary:');
      console.log(`✅ Updated: ${updated}`);
      console.log(`⏭️ Skipped: ${skipped}`);
      console.log(`❌ Errors: ${errors}`);
      console.log(`📋 Total: ${updated + skipped + errors}`);

    } catch (error) {
      console.error('❌ Failed to update provider configurations:', error.message);
      process.exit(1);
    }
  }

  /**
   * Update a single provider config file
   * @param {string} providerName - Name of the provider
   * @returns {Promise<boolean>} True if updated, false if skipped
   */
  async updateProviderConfig(providerName) {
    const configFile = path.join(this.configDir, `${providerName}.json`);
    
    // Check if config file exists
    try {
      await fs.access(configFile);
    } catch (error) {
      console.log(`⏭️ Skipping ${providerName}: config file not found`);
      return false;
    }

    // Load existing config
    const existingConfigData = await fs.readFile(configFile, 'utf8');
    const existingConfig = JSON.parse(existingConfigData);

    // Get provider info from central mapping
    const providerInfo = await providerEndpointManager.getProviderInfo(providerName);
    if (!providerInfo) {
      console.log(`⏭️ Skipping ${providerName}: not found in central mapping`);
      return false;
    }

    // Check if update is needed
    const needsUpdate = this.checkIfUpdateNeeded(existingConfig, providerInfo);
    if (!needsUpdate) {
      console.log(`⏭️ Skipping ${providerName}: already up to date`);
      return false;
    }

    // Update the config
    const updatedConfig = this.mergeConfigs(existingConfig, providerInfo);

    // Write updated config
    await fs.writeFile(configFile, JSON.stringify(updatedConfig, null, 2));
    console.log(`✅ Updated ${providerName}: added model endpoint and file path`);

    return true;
  }

  /**
   * Check if provider config needs updating
   * @param {Object} existingConfig - Current provider config
   * @param {Object} providerInfo - Provider info from central mapping
   * @returns {boolean} True if update is needed
   */
  checkIfUpdateNeeded(existingConfig, providerInfo) {
    // Check if modelsEndpoint is missing or different
    if (!existingConfig.modelsEndpoint) {
      return true;
    }
    
    if (existingConfig.modelsEndpoint !== providerInfo.modelsEndpoint) {
      return true;
    }

    // Check if modelsFile is missing
    if (!existingConfig.modelsFile) {
      return true;
    }

    return false;
  }

  /**
   * Merge existing config with provider info from central mapping
   * @param {Object} existingConfig - Current provider config
   * @param {Object} providerInfo - Provider info from central mapping
   * @returns {Object} Updated config
   */
  mergeConfigs(existingConfig, providerInfo) {
    return {
      ...existingConfig,
      modelsEndpoint: providerInfo.modelsEndpoint,
      modelsFile: existingConfig.modelsFile || `./data/models/${providerInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.json`
    };
  }

  /**
   * Validate all provider configs after update
   */
  async validateProviderConfigs() {
    console.log('\n🔍 Validating updated configurations...');
    
    const configFiles = await fs.readdir(this.configDir);
    const jsonFiles = configFiles.filter(file => file.endsWith('.json'));
    
    let valid = 0;
    let invalid = 0;

    for (const file of jsonFiles) {
      const configPath = path.join(this.configDir, file);
      const providerName = path.basename(file, '.json');
      
      try {
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // Basic validation
        if (this.validateConfig(config)) {
          console.log(`✅ ${providerName}: Valid configuration`);
          valid++;
        } else {
          console.log(`⚠️ ${providerName}: Configuration warnings`);
          invalid++;
        }
      } catch (error) {
        console.log(`❌ ${providerName}: Invalid JSON - ${error.message}`);
        invalid++;
      }
    }

    console.log(`\n📊 Validation Summary: ${valid} valid, ${invalid} with issues`);
  }

  /**
   * Validate a provider config
   * @param {Object} config - Provider configuration
   * @returns {boolean} True if valid
   */
  validateConfig(config) {
    const required = ['url'];
    const recommended = ['model', 'createMessageObject'];
    
    let isValid = true;

    // Check required fields
    for (const field of required) {
      if (!config[field]) {
        console.log(`    ❌ Missing required field: ${field}`);
        isValid = false;
      }
    }

    // Check recommended fields
    for (const field of recommended) {
      if (!config[field]) {
        console.log(`    ⚠️ Missing recommended field: ${field}`);
      }
    }

    // Check model endpoint if present
    if (config.modelsEndpoint && !config.modelsFile) {
      console.log(`    ⚠️ modelsEndpoint present but modelsFile missing`);
    }

    return isValid;
  }

  /**
   * Generate a report of all provider configurations
   */
  async generateReport() {
    console.log('\n📋 Generating provider configuration report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalProviders: 0,
        withModelEndpoints: 0,
        withoutModelEndpoints: 0,
        withModelFiles: 0
      },
      providers: []
    };

    const configFiles = await fs.readdir(this.configDir);
    const jsonFiles = configFiles.filter(file => file.endsWith('.json'));
    
    for (const file of jsonFiles) {
      const configPath = path.join(this.configDir, file);
      const providerName = path.basename(file, '.json');
      
      try {
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        const providerReport = {
          name: providerName,
          hasModelEndpoint: !!config.modelsEndpoint,
          hasModelFile: !!config.modelsFile,
          hasEmbeddings: !!config.hasEmbeddings,
          hasStreaming: !!config.stream,
          hasJsonMode: !!config.jsonMode,
          modelEndpoint: config.modelsEndpoint || null,
          modelFile: config.modelsFile || null
        };
        
        report.providers.push(providerReport);
        report.summary.totalProviders++;
        
        if (config.modelsEndpoint) report.summary.withModelEndpoints++;
        else report.summary.withoutModelEndpoints++;
        
        if (config.modelsFile) report.summary.withModelFiles++;
        
      } catch (error) {
        console.error(`❌ Failed to read ${providerName}: ${error.message}`);
      }
    }

    // Write report to file
    const reportPath = path.join(__dirname, '../provider-config-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📊 Summary: ${report.summary.withModelEndpoints}/${report.summary.totalProviders} providers have model endpoints`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'update';
  
  const updater = new ProviderConfigUpdater();
  
  switch (command) {
    case 'update':
      await updater.updateAllProviderConfigs();
      break;
      
    case 'validate':
      await updater.validateProviderConfigs();
      break;
      
    case 'report':
      await updater.generateReport();
      break;
      
    case 'all':
      await updater.updateAllProviderConfigs();
      await updater.validateProviderConfigs();
      await updater.generateReport();
      break;
      
    default:
      console.log(`
🛠️ Provider Configuration Updater

Usage: node scripts/updateProviderEndpoints.js [command]

Commands:
  update    Update all provider configs with model endpoints (default)
  validate  Validate all provider configurations
  report    Generate configuration report
  all       Run update, validate, and report

Examples:
  node scripts/updateProviderEndpoints.js
  node scripts/updateProviderEndpoints.js update
  node scripts/updateProviderEndpoints.js all
      `);
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = ProviderConfigUpdater;
