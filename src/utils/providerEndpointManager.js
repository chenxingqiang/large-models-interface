/**
 * @file src/utils/providerEndpointManager.js
 * @description Provider endpoint management utilities for centralized model discovery
 */

const fs = require('fs').promises;
const path = require('path');

class ProviderEndpointManager {
  constructor() {
    this.endpointsFile = path.join(__dirname, '../config/providerModelEndpoints.json');
    this.cache = null;
    this.lastLoaded = null;
  }

  /**
   * Load provider endpoints configuration
   * @returns {Promise<Object>} Provider endpoints configuration
   */
  async loadProviderEndpoints() {
    try {
      // Use cache if loaded within last 5 minutes
      if (this.cache && this.lastLoaded && (Date.now() - this.lastLoaded < 5 * 60 * 1000)) {
        return this.cache;
      }

      const data = await fs.readFile(this.endpointsFile, 'utf8');
      this.cache = JSON.parse(data);
      this.lastLoaded = Date.now();
      
      console.log(`📋 Loaded ${this.cache.metadata.totalProviders} provider endpoints`);
      return this.cache;
    } catch (error) {
      console.error(`❌ Failed to load provider endpoints: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get model endpoint for a specific provider
   * @param {string} providerName - Name of the provider
   * @returns {Promise<string|null>} Model endpoint URL or null if not found
   */
  async getModelEndpoint(providerName) {
    const config = await this.loadProviderEndpoints();
    const provider = config.providers[providerName];
    
    if (!provider) {
      console.warn(`⚠️ Provider '${providerName}' not found in endpoints configuration`);
      return null;
    }

    if (provider.status !== 'active' && provider.status !== 'local') {
      console.warn(`⚠️ Provider '${providerName}' is not active (status: ${provider.status})`);
      return null;
    }

    return provider.modelsEndpoint;
  }

  /**
   * Get provider information
   * @param {string} providerName - Name of the provider
   * @returns {Promise<Object|null>} Provider information or null if not found
   */
  async getProviderInfo(providerName) {
    const config = await this.loadProviderEndpoints();
    return config.providers[providerName] || null;
  }

  /**
   * Get all providers by category
   * @param {string} category - Category name (global, chinese, opensource, etc.)
   * @returns {Promise<Array>} Array of provider names in the category
   */
  async getProvidersByCategory(category) {
    const config = await this.loadProviderEndpoints();
    return config.categories[category] || [];
  }

  /**
   * Get providers that support a specific feature
   * @param {string} feature - Feature name (chat, vision, audio, etc.)
   * @returns {Promise<Array>} Array of provider names that support the feature
   */
  async getProvidersByFeature(feature) {
    const config = await this.loadProviderEndpoints();
    return config.features[feature] || [];
  }

  /**
   * Get all active providers
   * @returns {Promise<Array>} Array of active provider names
   */
  async getActiveProviders() {
    const config = await this.loadProviderEndpoints();
    return Object.keys(config.providers).filter(name => 
      config.providers[name].status === 'active' || 
      config.providers[name].status === 'local'
    );
  }

  /**
   * Update provider configuration file with new endpoints
   * @param {string} providerName - Name of the provider
   * @param {Object} providerConfig - Provider configuration
   * @returns {Promise<void>}
   */
  async updateProviderEndpoint(providerName, providerConfig) {
    const config = await this.loadProviderEndpoints();
    
    config.providers[providerName] = {
      ...config.providers[providerName],
      ...providerConfig,
      lastUpdated: new Date().toISOString()
    };
    
    config.metadata.lastUpdated = new Date().toISOString();
    config.metadata.totalProviders = Object.keys(config.providers).length;
    
    await fs.writeFile(this.endpointsFile, JSON.stringify(config, null, 2));
    
    // Clear cache to force reload
    this.cache = null;
    
    console.log(`✅ Updated provider configuration for '${providerName}'`);
  }

  /**
   * Add a new provider to the configuration
   * @param {string} providerName - Name of the provider
   * @param {Object} providerConfig - Complete provider configuration
   * @returns {Promise<void>}
   */
  async addProvider(providerName, providerConfig) {
    const config = await this.loadProviderEndpoints();
    
    if (config.providers[providerName]) {
      throw new Error(`Provider '${providerName}' already exists`);
    }
    
    config.providers[providerName] = {
      ...providerConfig,
      addedAt: new Date().toISOString()
    };
    
    config.metadata.lastUpdated = new Date().toISOString();
    config.metadata.totalProviders = Object.keys(config.providers).length;
    
    await fs.writeFile(this.endpointsFile, JSON.stringify(config, null, 2));
    
    // Clear cache to force reload
    this.cache = null;
    
    console.log(`✅ Added new provider '${providerName}'`);
  }

  /**
   * Generate provider statistics
   * @returns {Promise<Object>} Provider statistics
   */
  async getProviderStats() {
    const config = await this.loadProviderEndpoints();
    
    const stats = {
      total: Object.keys(config.providers).length,
      active: 0,
      local: 0,
      inactive: 0,
      byAuthType: {},
      byFeature: {},
      byCategory: {}
    };
    
    // Count by status
    Object.values(config.providers).forEach(provider => {
      if (provider.status === 'active') stats.active++;
      else if (provider.status === 'local') stats.local++;
      else stats.inactive++;
      
      // Count by auth type
      stats.byAuthType[provider.authType] = (stats.byAuthType[provider.authType] || 0) + 1;
    });
    
    // Count by feature
    Object.entries(config.features).forEach(([feature, providers]) => {
      stats.byFeature[feature] = providers.length;
    });
    
    // Count by category
    Object.entries(config.categories).forEach(([category, providers]) => {
      stats.byCategory[category] = providers.length;
    });
    
    return stats;
  }

  /**
   * Validate provider endpoints (check if URLs are accessible)
   * @param {Array} providerNames - Optional array of provider names to validate, defaults to all active
   * @returns {Promise<Object>} Validation results
   */
  async validateProviderEndpoints(providerNames = null) {
    const config = await this.loadProviderEndpoints();
    const axios = require('axios');
    
    const providersToCheck = providerNames || await this.getActiveProviders();
    const results = {
      validated: 0,
      accessible: 0,
      inaccessible: 0,
      errors: []
    };
    
    console.log(`🔍 Validating ${providersToCheck.length} provider endpoints...`);
    
    for (const providerName of providersToCheck) {
      const provider = config.providers[providerName];
      if (!provider || !provider.modelsEndpoint) continue;
      
      results.validated++;
      
      try {
        // Skip local endpoints
        if (provider.status === 'local') {
          console.log(`⏭️ Skipping local provider: ${providerName}`);
          continue;
        }
        
        // Simple HEAD request to check if endpoint is accessible
        const response = await axios.head(provider.modelsEndpoint, {
          timeout: 5000,
          validateStatus: status => status < 500 // Accept client errors but not server errors
        });
        
        results.accessible++;
        console.log(`✅ ${providerName}: ${response.status}`);
        
      } catch (error) {
        results.inaccessible++;
        results.errors.push({
          provider: providerName,
          endpoint: provider.modelsEndpoint,
          error: error.message
        });
        console.log(`❌ ${providerName}: ${error.message}`);
      }
    }
    
    console.log(`📊 Validation complete: ${results.accessible}/${results.validated} endpoints accessible`);
    return results;
  }

  /**
   * Export provider endpoints to different formats
   * @param {string} format - Export format: 'json', 'csv', 'yaml'
   * @param {string} outputPath - Output file path
   * @returns {Promise<void>}
   */
  async exportProviderEndpoints(format = 'json', outputPath = null) {
    const config = await this.loadProviderEndpoints();
    
    if (!outputPath) {
      outputPath = `./provider-endpoints.${format}`;
    }
    
    switch (format.toLowerCase()) {
      case 'json':
        await fs.writeFile(outputPath, JSON.stringify(config, null, 2));
        break;
        
      case 'csv':
        const csv = this.generateCSV(config);
        await fs.writeFile(outputPath, csv);
        break;
        
      case 'yaml':
        // Simple YAML export (would need yaml library for complex structures)
        const yaml = this.generateYAML(config);
        await fs.writeFile(outputPath, yaml);
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    console.log(`📄 Exported provider endpoints to ${outputPath} (${format.toUpperCase()})`);
  }

  /**
   * Generate CSV format from config
   * @param {Object} config - Provider configuration
   * @returns {string} CSV content
   */
  generateCSV(config) {
    const headers = ['Provider', 'Name', 'Website', 'ModelsEndpoint', 'AuthType', 'Status', 'Features'];
    const rows = [headers.join(',')];
    
    Object.entries(config.providers).forEach(([key, provider]) => {
      const features = provider.supportedFeatures ? provider.supportedFeatures.join(';') : '';
      const row = [
        key,
        `"${provider.name}"`,
        provider.website,
        provider.modelsEndpoint,
        provider.authType,
        provider.status,
        `"${features}"`
      ];
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  }

  /**
   * Generate simple YAML format from config
   * @param {Object} config - Provider configuration
   * @returns {string} YAML content
   */
  generateYAML(config) {
    let yaml = `# Provider Model Endpoints Configuration\n`;
    yaml += `# Generated: ${new Date().toISOString()}\n\n`;
    yaml += `metadata:\n`;
    yaml += `  version: "${config.metadata.version}"\n`;
    yaml += `  totalProviders: ${config.metadata.totalProviders}\n\n`;
    yaml += `providers:\n`;
    
    Object.entries(config.providers).forEach(([key, provider]) => {
      yaml += `  ${key}:\n`;
      yaml += `    name: "${provider.name}"\n`;
      yaml += `    website: "${provider.website}"\n`;
      yaml += `    modelsEndpoint: "${provider.modelsEndpoint}"\n`;
      yaml += `    authType: "${provider.authType}"\n`;
      yaml += `    status: "${provider.status}"\n`;
      if (provider.supportedFeatures) {
        yaml += `    features: [${provider.supportedFeatures.map(f => `"${f}"`).join(', ')}]\n`;
      }
      yaml += `\n`;
    });
    
    return yaml;
  }
}

// Export singleton instance
const providerEndpointManager = new ProviderEndpointManager();
module.exports = providerEndpointManager;
