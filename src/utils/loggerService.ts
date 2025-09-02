/**
 * Centralized logging service for consistent log management across the application
 * - Standardizes log format
 * - Controls log levels based on environment
 * - Prevents sensitive data leakage in production
 */

// Log levels in order of verbosity
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// Log categories for better filtering
export enum LogCategory {
  DATA = 'DATA',
  UI = 'UI',
  AUTH = 'AUTH',
  API = 'API',
  STORAGE = 'STORAGE',
  PERFORMANCE = 'PERFORMANCE'
}

// Configuration interface for the logger
interface LoggerConfig {
  minLevel: LogLevel;
  enabled: boolean;
  showTimestamp: boolean;
  showCategory: boolean;
  persistLogs?: boolean; // Whether to also save logs to localStorage for debugging
  maxPersistedLogs?: number; // Maximum number of logs to keep if persisting
}

// Default configuration based on environment
const defaultConfig: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' 
    ? LogLevel.ERROR  // Only errors in production
    : LogLevel.DEBUG, // Debug and above in development
  enabled: true,
  showTimestamp: true,
  showCategory: true,
  persistLogs: process.env.NODE_ENV !== 'production',
  maxPersistedLogs: 1000
};

// The current configuration
let currentConfig: LoggerConfig = { ...defaultConfig };

// Storage key for persisted logs
const PERSISTED_LOGS_KEY = 'app_logs';

// The actual logger service
export const Logger = {
  /**
   * Configure the logger service
   * @param config Updated configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    currentConfig = { ...currentConfig, ...config };
  },

  /**
   * Get current logger configuration
   */
  getConfig(): LoggerConfig {
    return { ...currentConfig };
  },

  /**
   * Log a message at the ERROR level
   * @param message Log message
   * @param category Log category
   * @param data Additional data to log
   */
  error(message: string, category: LogCategory = LogCategory.UI, data?: any): void {
    this.log(LogLevel.ERROR, message, category, data);
  },

  /**
   * Log a message at the WARN level
   * @param message Log message
   * @param category Log category
   * @param data Additional data to log
   */
  warn(message: string, category: LogCategory = LogCategory.UI, data?: any): void {
    this.log(LogLevel.WARN, message, category, data);
  },

  /**
   * Log a message at the INFO level
   * @param message Log message
   * @param category Log category
   * @param data Additional data to log
   */
  info(message: string, category: LogCategory = LogCategory.UI, data?: any): void {
    this.log(LogLevel.INFO, message, category, data);
  },

  /**
   * Log a message at the DEBUG level
   * @param message Log message
   * @param category Log category
   * @param data Additional data to log
   */
  debug(message: string, category: LogCategory = LogCategory.UI, data?: any): void {
    this.log(LogLevel.DEBUG, message, category, data);
  },

  /**
   * Log a message at the TRACE level
   * @param message Log message
   * @param category Log category
   * @param data Additional data to log
   */
  trace(message: string, category: LogCategory = LogCategory.UI, data?: any): void {
    this.log(LogLevel.TRACE, message, category, data);
  },

  /**
   * Generic log method that handles all log levels
   * @param level Log level
   * @param message Log message
   * @param category Log category
   * @param data Additional data to log
   */
  log(level: LogLevel, message: string, category: LogCategory = LogCategory.UI, data?: any): void {
    // If logging is disabled or level is too verbose, do nothing
    if (!currentConfig.enabled || level > currentConfig.minLevel) {
      return;
    }

    // Build log entry
    const entry = this.formatLogEntry(level, message, category, data);

    // Output to console
    this.outputToConsole(level, entry, data);

    // Persist if enabled
    if (currentConfig.persistLogs) {
      this.persistLog(entry);
    }
  },

  /**
   * Format a log entry with timestamps and category if configured
   * @internal
   */
  formatLogEntry(level: LogLevel, message: string, category: LogCategory, data?: any): string {
    const parts: string[] = [];

    // Add timestamp if configured
    if (currentConfig.showTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    // Add log level
    parts.push(`[${LogLevel[level]}]`);

    // Add category if configured
    if (currentConfig.showCategory) {
      parts.push(`[${category}]`);
    }

    // Add message
    parts.push(message);

    return parts.join(' ');
  },

  /**
   * Output a log entry to the console using the appropriate console method
   * @internal
   */
  outputToConsole(level: LogLevel, formattedMessage: string, data?: any): void {
    switch (level) {
      case LogLevel.ERROR:
        if (data) console.error(formattedMessage, data);
        else console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        if (data) console.warn(formattedMessage, data);
        else console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        if (data) console.info(formattedMessage, data);
        else console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
      default:
        if (data) console.log(formattedMessage, data);
        else console.log(formattedMessage);
        break;
    }
  },

  /**
   * Persist logs to localStorage for debugging
   * @internal
   */
  persistLog(entry: string): void {
    if (typeof window === 'undefined' || !localStorage) return;

    try {
      // Get existing logs
      const storedLogs = localStorage.getItem(PERSISTED_LOGS_KEY);
      let logs: string[] = storedLogs ? JSON.parse(storedLogs) : [];

      // Add new log
      logs.push(entry);

      // Trim if needed
      if (currentConfig.maxPersistedLogs && logs.length > currentConfig.maxPersistedLogs) {
        logs = logs.slice(logs.length - currentConfig.maxPersistedLogs);
      }

      // Save back to localStorage
      localStorage.setItem(PERSISTED_LOGS_KEY, JSON.stringify(logs));
    } catch (err) {
      // If we can't persist logs, just log the error to console
      console.error('Failed to persist logs:', err);
    }
  },

  /**
   * Retrieve persisted logs
   */
  getPersistedLogs(): string[] {
    if (typeof window === 'undefined' || !localStorage) return [];

    try {
      const storedLogs = localStorage.getItem(PERSISTED_LOGS_KEY);
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (err) {
      console.error('Failed to retrieve persisted logs:', err);
      return [];
    }
  },

  /**
   * Clear persisted logs
   */
  clearPersistedLogs(): void {
    if (typeof window === 'undefined' || !localStorage) return;
    localStorage.removeItem(PERSISTED_LOGS_KEY);
  }
};

/**
 * React hook for using the logger in components
 */
export function useLogger(category: LogCategory = LogCategory.UI) {
  return {
    error: (message: string, data?: any) => Logger.error(message, category, data),
    warn: (message: string, data?: any) => Logger.warn(message, category, data),
    info: (message: string, data?: any) => Logger.info(message, category, data),
    debug: (message: string, data?: any) => Logger.debug(message, category, data),
    trace: (message: string, data?: any) => Logger.trace(message, category, data)
  };
}
