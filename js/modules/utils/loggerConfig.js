/**
 * Logger Configuration
 * Central place to configure logging settings for different modules
 */
import { LOG_LEVELS } from './logger.js';

// Default configuration settings
const defaultConfig = {
  level: LOG_LEVELS.INFO,
  enableTimestamps: true,
  moduleFilter: null
};

// Environment-specific configurations
const environmentConfigs = {
  development: {
    level: LOG_LEVELS.DEBUG,
    enableTimestamps: true
  },
  testing: {
    level: LOG_LEVELS.INFO,
    enableTimestamps: true
  },
  production: {
    level: LOG_LEVELS.WARN,
    enableTimestamps: false
  }
};

// Module-specific configurations can override the environment settings
const moduleConfigs = {
  // Example: Override settings for specific modules
  uiManager: {
    level: LOG_LEVELS.DEBUG
  },
  textComparison: {
    level: LOG_LEVELS.INFO
  }
};

/**
 * Get logger configuration for a specific module
 * @param {string} moduleName - The name of the module
 * @returns {Object} Logger configuration for the module
 */
export function getLoggerConfig(moduleName) {
  // Determine current environment
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const environment = isDevelopment ? 'development' : 'production';
  
  // Start with default config
  const config = { ...defaultConfig };
  
  // Apply environment-specific config
  if (environmentConfigs[environment]) {
    Object.assign(config, environmentConfigs[environment]);
  }
  
  // Apply module-specific config if available
  if (moduleName && moduleConfigs[moduleName]) {
    Object.assign(config, moduleConfigs[moduleName]);
  }
  
  return config;
}

/**
 * Configure all loggers at application startup
 * This initializes logging based on the current environment
 */
export function initializeLogging() {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const environment = isDevelopment ? 'development' : 'production';
  
  console.log(`Initializing logging for ${environment} environment`);
  
  // Any global logging setup can be added here
  
  return {
    environment,
    config: environmentConfigs[environment] || defaultConfig
  };
}

// Export the configurations in case they're needed elsewhere
export { defaultConfig, environmentConfigs, moduleConfigs };
