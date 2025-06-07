/**
 * Logger Module
 * Provides standardized logging for debugging with configurable levels
 */

// Log levels 
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Default configuration - will be overridden by loggerConfig.js
let config = {
  level: LOG_LEVELS.INFO,  // Default level
  enableTimestamps: true,
  moduleFilter: null       // No filter by default
};

/**
 * Configure the logger
 * @param {Object} options - Configuration options
 * @param {number} options.level - Minimum log level to display
 * @param {boolean} options.enableTimestamps - Whether to include timestamps
 * @param {string|Array} options.moduleFilter - Specific module(s) to show logs for
 */
export function configureLogger(options) {
  config = { ...config, ...options };
}

/**
 * Format a log message with optional timestamp and module info
 * @param {string} level - Log level indicator
 * @param {string} message - The message to log
 * @param {string} [moduleName] - Optional module name
 * @param {any} [data] - Optional data to include
 * @returns {string} Formatted log message
 */
function formatMessage(level, message, moduleName, data) {
  const parts = [];
  
  // Add timestamp if enabled
  if (config.enableTimestamps) {
    parts.push(`[${new Date().toISOString()}]`);
  }
  
  // Add log level
  parts.push(`[${level}]`);
  
  // Add module name if provided
  if (moduleName) {
    parts.push(`[${moduleName}]`);
  }
  
  // Add message
  parts.push(message);
  
  return parts.join(' ');
}

/**
 * Check if this module should be logged based on filters
 * @param {string} moduleName - Name of the module
 * @returns {boolean} True if module passes the filter
 */
function shouldLogModule(moduleName) {
  if (!config.moduleFilter) return true;
  
  if (Array.isArray(config.moduleFilter)) {
    return config.moduleFilter.includes(moduleName);
  }
  
  return config.moduleFilter === moduleName;
}

// Import config lazily to avoid circular dependencies
let getLoggerConfig;

/**
 * Create a logger instance for a specific module
 * @param {string} moduleName - Name of the module for this logger
 * @returns {Object} Logger instance with debug, info, warn, error methods
 */
export function createLogger(moduleName) {
  // In ES modules we can't dynamically import, so just use default config for now
  // We'll properly integrate this with ES modules in the future
  getLoggerConfig = () => config;

  // Get module-specific configuration
  const moduleConfig = getLoggerConfig ? getLoggerConfig(moduleName) : config;

  return {
    debug(message, data) {
      if (moduleConfig.level <= LOG_LEVELS.DEBUG && shouldLogModule(moduleName)) {
        console.log(formatMessage('DEBUG', message, moduleName), data || '');
      }
    },
    
    info(message, data) {
      if (moduleConfig.level <= LOG_LEVELS.INFO && shouldLogModule(moduleName)) {
        console.info(formatMessage('INFO', message, moduleName), data || '');
      }
    },
    
    warn(message, data) {
      if (moduleConfig.level <= LOG_LEVELS.WARN && shouldLogModule(moduleName)) {
        console.warn(formatMessage('WARN', message, moduleName), data || '');
      }
    },
    
    error(message, data) {
      if (moduleConfig.level <= LOG_LEVELS.ERROR && shouldLogModule(moduleName)) {
        console.error(formatMessage('ERROR', message, moduleName), data || '');
      }
    }
  };
}

// Export log levels so they can be used when configuring
export { LOG_LEVELS };
