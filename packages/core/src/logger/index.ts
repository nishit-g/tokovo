/**
 * Tokovo Structured Logger
 *
 * Enterprise-grade logging system for AI-generated content rendering.
 *
 * Features:
 * - Structured log entries with component, level, timestamp
 * - Log collection for debugging AI output
 * - Filterable by level and component
 * - Production-safe (disable debug in production)
 * - JSON serializable for external tools
 *
 * Usage:
 *   import { logger, LogCollector } from '@tokovo/core';
 *
 *   // Basic logging
 *   logger.info('engine', 'Replay started', { frame: 0 });
 *
 *   // Collect logs for debugging
 *   const collector = new LogCollector();
 *   logger.addSubscriber(collector);
 *   // ... render ...
 *   const logs = collector.flush();
 */
/* eslint-disable no-console */

// =============================================================================
// TYPES
// =============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogComponent =
  | "engine"
  | "compiler"
  | "renderer"
  | "validation"
  | "schema"
  | "plugin"
  | "camera"
  | "audio"
  | "device"
  | "app"
  | "notification"
  | "keyboard"
  | "call"
  | "os"
  | string; // Allow custom components

export interface LogEntry {
  /** Monotonic ID for ordering */
  id: number;
  /** Log level */
  level: LogLevel;
  /** Component that generated the log */
  component: LogComponent;
  /** Human-readable message */
  message: string;
  /** Structured data payload */
  data?: Record<string, unknown>;
  /** Unix timestamp in ms */
  timestamp: number;
  /** Optional frame number for timeline correlation */
  frame?: number;
  /** Optional error object */
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LogSubscriber {
  onLog(entry: LogEntry): void;
}

export interface LoggerConfig {
  /** Minimum level to log (default: 'info' in production, 'debug' in dev) */
  minLevel: LogLevel;
  /** Components to log (empty = all) */
  components: LogComponent[];
  /** Whether to output to console */
  consoleOutput: boolean;
  /** Whether to include stack traces in errors */
  includeStackTraces: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_LEVEL_STYLES: Record<LogLevel, string> = {
  debug: "color: #888",
  info: "color: #2196F3",
  warn: "color: #FF9800",
  error: "color: #F44336; font-weight: bold",
};

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const isProduction =
  typeof process !== "undefined" && process.env?.NODE_ENV === "production";
const isBrowser = typeof window !== "undefined";

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: isProduction ? "warn" : "debug",
  components: [],
  consoleOutput: !isProduction,
  includeStackTraces: !isProduction,
};

// =============================================================================
// LOGGER IMPLEMENTATION
// =============================================================================

class TokovoLogger {
  private config: LoggerConfig;
  private subscribers: Set<LogSubscriber> = new Set();
  private idCounter = 0;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): Readonly<LoggerConfig> {
    return { ...this.config };
  }

  setLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  enableConsole(): void {
    this.config.consoleOutput = true;
  }

  disableConsole(): void {
    this.config.consoleOutput = false;
  }

  // ---------------------------------------------------------------------------
  // Subscribers
  // ---------------------------------------------------------------------------

  addSubscriber(subscriber: LogSubscriber): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  removeSubscriber(subscriber: LogSubscriber): void {
    this.subscribers.delete(subscriber);
  }

  clearSubscribers(): void {
    this.subscribers.clear();
  }

  // ---------------------------------------------------------------------------
  // Logging Methods
  // ---------------------------------------------------------------------------

  debug(
    component: LogComponent,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    this.log("debug", component, message, data);
  }

  info(
    component: LogComponent,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    this.log("info", component, message, data);
  }

  warn(
    component: LogComponent,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    this.log("warn", component, message, data);
  }

  error(
    component: LogComponent,
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>,
  ): void {
    const errorData = this.serializeError(error);
    this.log("error", component, message, { ...data, ...errorData });
  }

  /**
   * Log with explicit frame number for timeline correlation
   */
  atFrame(
    frame: number,
    level: LogLevel,
    component: LogComponent,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    this.log(level, component, message, { ...data, frame });
  }

  // ---------------------------------------------------------------------------
  // Core Log Method
  // ---------------------------------------------------------------------------

  private log(
    level: LogLevel,
    component: LogComponent,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    // Check level filter
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.minLevel]) {
      return;
    }

    // Check component filter
    if (
      this.config.components.length > 0 &&
      !this.config.components.includes(component)
    ) {
      return;
    }

    const entry: LogEntry = {
      id: ++this.idCounter,
      level,
      component,
      message,
      data,
      timestamp: Date.now(),
      frame: typeof data?.frame === "number" ? data.frame : undefined,
    };

    // Extract error if present
    if (data?.error) {
      entry.error = data.error as LogEntry["error"];
    }

    // Console output
    if (this.config.consoleOutput) {
      this.outputToConsole(entry);
    }

    // Notify subscribers
    for (const subscriber of this.subscribers) {
      try {
        subscriber.onLog(entry);
      } catch {
        // Never let subscriber errors break logging
      }
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.component}]`;
    const frameInfo = entry.frame !== undefined ? `@${entry.frame}` : "";
    const fullMessage = `${prefix}${frameInfo} ${entry.message}`;

    if (isBrowser) {
      // Browser: use styled console output
      const style = LOG_LEVEL_STYLES[entry.level];
      if (entry.data && Object.keys(entry.data).length > 0) {
        console[entry.level](`%c${fullMessage}`, style, entry.data);
      } else {
        console[entry.level](`%c${fullMessage}`, style);
      }
    } else {
      // Node: plain output
      if (entry.data && Object.keys(entry.data).length > 0) {
        console[entry.level](fullMessage, entry.data);
      } else {
        console[entry.level](fullMessage);
      }
    }
  }

  private serializeError(
    error: Error | unknown,
  ): { error: LogEntry["error"] } | undefined {
    if (!error) return undefined;

    if (error instanceof Error) {
      return {
        error: {
          name: error.name,
          message: error.message,
          stack: this.config.includeStackTraces ? error.stack : undefined,
        },
      };
    }

    return {
      error: {
        name: "UnknownError",
        message: String(error),
      },
    };
  }
}

// =============================================================================
// LOG COLLECTOR
// =============================================================================

/**
 * Collects logs in memory for later analysis.
 * Use for debugging AI-generated episodes.
 */
export class LogCollector implements LogSubscriber {
  private entries: LogEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries = 10000) {
    this.maxEntries = maxEntries;
  }

  onLog(entry: LogEntry): void {
    this.entries.push(entry);
    // Prevent memory explosion
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  /**
   * Get all collected logs and clear the buffer
   */
  flush(): LogEntry[] {
    const result = [...this.entries];
    this.entries = [];
    return result;
  }

  /**
   * Get logs without clearing
   */
  peek(): readonly LogEntry[] {
    return this.entries;
  }

  /**
   * Get logs filtered by level
   */
  getByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter((e) => e.level === level);
  }

  /**
   * Get logs filtered by component
   */
  getByComponent(component: LogComponent): LogEntry[] {
    return this.entries.filter((e) => e.component === component);
  }

  /**
   * Get logs for a specific frame range
   */
  getByFrameRange(startFrame: number, endFrame: number): LogEntry[] {
    return this.entries.filter(
      (e) =>
        e.frame !== undefined && e.frame >= startFrame && e.frame <= endFrame,
    );
  }

  /**
   * Get errors only
   */
  getErrors(): LogEntry[] {
    return this.getByLevel("error");
  }

  /**
   * Get warnings and errors
   */
  getIssues(): LogEntry[] {
    return this.entries.filter(
      (e) => e.level === "warn" || e.level === "error",
    );
  }

  /**
   * Check if any errors were logged
   */
  hasErrors(): boolean {
    return this.entries.some((e) => e.level === "error");
  }

  /**
   * Get count by level
   */
  getCounts(): Record<LogLevel, number> {
    return {
      debug: this.entries.filter((e) => e.level === "debug").length,
      info: this.entries.filter((e) => e.level === "info").length,
      warn: this.entries.filter((e) => e.level === "warn").length,
      error: this.entries.filter((e) => e.level === "error").length,
    };
  }

  /**
   * Export logs as JSON (for external tools)
   */
  toJSON(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.entries = [];
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

/**
 * Global logger instance.
 *
 * For most use cases, use this directly:
 *   import { logger } from '@tokovo/core';
 *   logger.info('engine', 'Event processed', { kind: 'DEVICE' });
 */
export const logger = new TokovoLogger();

/**
 * Create a scoped logger for a specific component.
 * Reduces boilerplate when logging from a single module.
 *
 * Usage:
 *   const log = createScopedLogger('engine');
 *   log.info('Event processed', { kind: 'DEVICE' });
 */
export function createScopedLogger(component: LogComponent) {
  return {
    debug: (message: string, data?: Record<string, unknown>) =>
      logger.debug(component, message, data),
    info: (message: string, data?: Record<string, unknown>) =>
      logger.info(component, message, data),
    warn: (message: string, data?: Record<string, unknown>) =>
      logger.warn(component, message, data),
    error: (
      message: string,
      error?: Error | unknown,
      data?: Record<string, unknown>,
    ) => logger.error(component, message, error, data),
    atFrame: (
      frame: number,
      level: LogLevel,
      message: string,
      data?: Record<string, unknown>,
    ) => logger.atFrame(frame, level, component, message, data),
  };
}

// =============================================================================
// BROWSER RUNTIME TOGGLE (dev convenience)
// =============================================================================

if (isBrowser) {
  // Allow runtime toggle from browser console
  (window as unknown as Record<string, unknown>).__TOKOVO_LOGGER = {
    enable: () => logger.enableConsole(),
    disable: () => logger.disableConsole(),
    setLevel: (level: LogLevel) => logger.setLevel(level),
    debug: () => logger.setLevel("debug"),
    info: () => logger.setLevel("info"),
    warn: () => logger.setLevel("warn"),
    error: () => logger.setLevel("error"),
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { TokovoLogger };
