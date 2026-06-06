export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogProfile = "quiet" | "operator" | "full";

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
  | "render-service"
  | string;

export interface LogEntry {
  id: number;
  level: LogLevel;
  component: LogComponent;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
  frame?: number;
  event?: string;
  jobId?: string;
  episodeId?: string;
  sourceSignature?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LogSink {
  onLog(entry: LogEntry): void;
}

export type LogSubscriber = LogSink;

export interface ScopedLogger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;
  atFrame(frame: number, level: LogLevel, message: string, data?: Record<string, unknown>): void;
  withContext(data: Record<string, unknown>): ScopedLogger;
}

export type PolicyDropReason =
  | "spam_gate"
  | "spam_softened"
  | "concurrency_limit"
  | "priority_too_low";

export interface PolicyDropEvent {
  soundId: string;
  bus: string;
  frame: number;
  reason: PolicyDropReason;
  alternateSound?: string;
  replacedBy?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  components: LogComponent[];
  consoleOutput: boolean;
  includeStackTraces: boolean;
  useColors: boolean;
  includeTimestamps: boolean;
  clock?: () => number;
}

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

const LOG_LEVEL_LABELS: Record<LogLevel, string> = {
  debug: "DBG",
  info: "INF",
  warn: "WRN",
  error: "ERR",
};

const ANSI_RESET = "\u001b[0m";
const ANSI_DIM = "\u001b[2m";
const ANSI_BOLD = "\u001b[1m";
const ANSI_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "\u001b[90m",
  info: "\u001b[36m",
  warn: "\u001b[33m",
  error: "\u001b[31m",
};

const COMPONENT_COLORS = [
  "\u001b[38;5;45m",
  "\u001b[38;5;81m",
  "\u001b[38;5;111m",
  "\u001b[38;5;149m",
  "\u001b[38;5;178m",
  "\u001b[38;5;203m",
  "\u001b[38;5;213m",
  "\u001b[38;5;117m",
];

const isProduction = typeof process !== "undefined" && process.env?.NODE_ENV === "production";
const isBrowser = typeof window !== "undefined";
const hasNodeConsoleColors =
  typeof process !== "undefined" &&
  process.stdout?.isTTY === true &&
  process.env?.NO_COLOR === undefined &&
  process.env?.CI !== "true";

type LoggerGlobals = {
  __TOKOVO_LOG_PROFILE?: LogProfile;
  __TOKOVO_LOG_LEVEL?: LogLevel;
  __TOKOVO_LOG_COMPONENTS?: string | string[];
  __TOKOVO_LOG_CONSOLE?: boolean;
  __TOKOVO_LOG_INCLUDE_STACKS?: boolean;
  __TOKOVO_LOG_COLORS?: boolean;
  __TOKOVO_LOG_TIMESTAMPS?: boolean;
};

const loggerGlobals = globalThis as typeof globalThis & LoggerGlobals;

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: isProduction ? "warn" : "info",
  components: [],
  consoleOutput: !isProduction,
  includeStackTraces: !isProduction,
  useColors: hasNodeConsoleColors,
  includeTimestamps: true,
  clock: () => Date.now(),
};

const LOG_PROFILE_DEFAULTS: Record<LogProfile, Partial<LoggerConfig>> = {
  quiet: {
    minLevel: "warn",
    consoleOutput: false,
    includeStackTraces: false,
    useColors: hasNodeConsoleColors,
    includeTimestamps: true,
  },
  operator: {
    minLevel: "info",
    consoleOutput: true,
    includeStackTraces: false,
    useColors: hasNodeConsoleColors,
    includeTimestamps: true,
  },
  full: {
    minLevel: "debug",
    consoleOutput: true,
    includeStackTraces: true,
    useColors: hasNodeConsoleColors,
    includeTimestamps: true,
  },
};

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(value.toLowerCase())) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(value.toLowerCase())) {
    return false;
  }

  return fallback;
}

function parseLevel(value: string | undefined, fallback: LogLevel): LogLevel {
  const normalized = value?.toLowerCase();
  if (
    normalized === "debug" ||
    normalized === "info" ||
    normalized === "warn" ||
    normalized === "error"
  ) {
    return normalized;
  }
  return fallback;
}

export function resolveLogProfile(value: string | undefined): LogProfile | undefined {
  const normalized = value?.toLowerCase();
  if (normalized === "quiet" || normalized === "operator" || normalized === "full") {
    return normalized;
  }

  return undefined;
}

export function getLogProfileDefaults(profile: LogProfile): Partial<LoggerConfig> {
  return LOG_PROFILE_DEFAULTS[profile];
}

function parseStringArray(value: string | string[] | undefined): string[] | undefined {
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return undefined;
}

function parseGlobalBoolean(value: boolean | undefined): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  return undefined;
}

function parseComponents(value: string | undefined): LogComponent[] {
  const parsed = parseStringArray(value);
  if (!parsed || parsed.length === 0 || parsed.includes("*")) {
    return [];
  }

  return parsed;
}

function resolveComponents(
  envValue: string | undefined,
  globalValue: string | string[] | undefined,
): LogComponent[] {
  if (envValue !== undefined) {
    return parseComponents(envValue);
  }

  const parsed = parseStringArray(globalValue);
  if (!parsed || parsed.length === 0 || parsed.includes("*")) {
    return [];
  }

  return parsed;
}

function extractStringField(
  data: Record<string, unknown> | undefined,
  key: "event" | "jobId" | "episodeId" | "sourceSignature",
): string | undefined {
  const value = data?.[key];
  return typeof value === "string" ? value : undefined;
}

function extractFrame(data: Record<string, unknown> | undefined): number | undefined {
  const frame = data?.frame;
  return typeof frame === "number" ? frame : undefined;
}

function extractError(data: Record<string, unknown> | undefined): LogEntry["error"] | undefined {
  const error = data?.error;
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const record = error as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name : "UnknownError";
  const message = typeof record.message === "string" ? record.message : String(error);
  const stack = typeof record.stack === "string" ? record.stack : undefined;
  return { name, message, stack };
}

function colorize(value: string, color: string, enabled: boolean): string {
  if (!enabled) {
    return value;
  }

  return `${color}${value}${ANSI_RESET}`;
}

function getComponentColor(component: LogComponent): string {
  let hash = 0;
  for (let index = 0; index < component.length; index++) {
    hash = (hash * 31 + component.charCodeAt(index)) >>> 0;
  }

  return COMPONENT_COLORS[hash % COMPONENT_COLORS.length] ?? ANSI_DIM;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const ms = String(date.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

function omitReservedFields(
  data: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!data) {
    return undefined;
  }

  const { event, jobId, episodeId, sourceSignature, frame, error, ...rest } = data;
  void event;
  void jobId;
  void episodeId;
  void sourceSignature;
  void frame;
  void error;

  if (Object.keys(rest).length === 0) {
    return undefined;
  }

  return rest;
}

function formatContextSummary(entry: LogEntry): string {
  const tags = [
    entry.jobId ? `job=${entry.jobId}` : undefined,
    entry.episodeId ? `episode=${entry.episodeId}` : undefined,
    entry.event ? `event=${entry.event}` : undefined,
    entry.frame !== undefined ? `frame=${entry.frame}` : undefined,
    entry.sourceSignature ? `sig=${entry.sourceSignature}` : undefined,
  ].filter((value): value is string => Boolean(value));

  return tags.length > 0 ? tags.join(" ") : "";
}

function getConsoleMethod(level: LogLevel): "debug" | "info" | "warn" | "error" {
  if (level === "debug") {
    return "debug";
  }

  if (level === "info") {
    return "info";
  }

  if (level === "warn") {
    return "warn";
  }

  return "error";
}

export function createConsoleLogSink(
  config: Pick<LoggerConfig, "useColors" | "includeTimestamps"> = DEFAULT_CONFIG,
): LogSink {
  return {
    onLog(entry) {
      const method = getConsoleMethod(entry.level);
      const summary = formatContextSummary(entry);
      const remainingData = omitReservedFields(entry.data);
      const timestamp = config.includeTimestamps ? `${formatTimestamp(entry.timestamp)} ` : "";
      const levelLabel = LOG_LEVEL_LABELS[entry.level];

      if (isBrowser) {
        const style = LOG_LEVEL_STYLES[entry.level];
        const componentStyle = "color: #9CA3AF";
        const detailStyle = "color: #A3A3A3";
        const browserMessage = `${timestamp}${levelLabel} [${entry.component}] ${entry.message}`;
        if (remainingData || summary || entry.error) {
          console[method](
            `%c${browserMessage}%c${summary ? ` ${summary}` : ""}`,
            style,
            detailStyle,
            remainingData ?? entry.error,
          );
        } else {
          console[method](
            `%c${timestamp}${levelLabel}%c [${entry.component}] ${entry.message}`,
            style,
            componentStyle,
          );
        }
        return;
      }

      const useColors = config.useColors;
      const formattedPrefix = [
        config.includeTimestamps ? colorize(timestamp.trimEnd(), ANSI_DIM, useColors) : "",
        colorize(
          levelLabel.padEnd(3, " "),
          `${ANSI_BOLD}${ANSI_LEVEL_COLORS[entry.level]}`,
          useColors,
        ),
        colorize(`[${entry.component}]`, getComponentColor(entry.component), useColors),
      ]
        .filter(Boolean)
        .join(" ");
      const formattedSummary = summary ? colorize(summary, ANSI_DIM, useColors) : "";
      const formattedMessage = [formattedPrefix, entry.message, formattedSummary]
        .filter(Boolean)
        .join(" ");

      if (remainingData || entry.error) {
        console[method](formattedMessage, remainingData ?? {}, entry.error ?? "");
      } else {
        console[method](formattedMessage);
      }
    },
  };
}

export function configureLoggerFromEnv(
  env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {},
): Partial<LoggerConfig> {
  const profile = resolveLogProfile(env.TOKOVO_LOG_PROFILE ?? loggerGlobals.__TOKOVO_LOG_PROFILE);
  const profileDefaults = profile ? getLogProfileDefaults(profile) : {};

  return {
    minLevel: parseLevel(
      env.TOKOVO_LOG_LEVEL,
      loggerGlobals.__TOKOVO_LOG_LEVEL ?? profileDefaults.minLevel ?? DEFAULT_CONFIG.minLevel,
    ),
    components: resolveComponents(env.TOKOVO_LOG_COMPONENTS, loggerGlobals.__TOKOVO_LOG_COMPONENTS),
    consoleOutput: parseBoolean(
      env.TOKOVO_LOG_CONSOLE,
      parseGlobalBoolean(loggerGlobals.__TOKOVO_LOG_CONSOLE) ??
        profileDefaults.consoleOutput ??
        DEFAULT_CONFIG.consoleOutput,
    ),
    includeStackTraces: parseBoolean(
      env.TOKOVO_LOG_INCLUDE_STACKS,
      parseGlobalBoolean(loggerGlobals.__TOKOVO_LOG_INCLUDE_STACKS) ??
        profileDefaults.includeStackTraces ??
        DEFAULT_CONFIG.includeStackTraces,
    ),
    useColors: parseBoolean(
      env.TOKOVO_LOG_COLORS,
      parseGlobalBoolean(loggerGlobals.__TOKOVO_LOG_COLORS) ??
        profileDefaults.useColors ??
        DEFAULT_CONFIG.useColors,
    ),
    includeTimestamps: parseBoolean(
      env.TOKOVO_LOG_TIMESTAMPS,
      parseGlobalBoolean(loggerGlobals.__TOKOVO_LOG_TIMESTAMPS) ??
        profileDefaults.includeTimestamps ??
        DEFAULT_CONFIG.includeTimestamps,
    ),
  };
}

export class TokovoLogger {
  private config: LoggerConfig;
  private sinks = new Set<LogSink>();
  private subscribers = new Set<LogSubscriber>();
  private idCounter = 0;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

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

  addSink(sink: LogSink): () => void {
    this.sinks.add(sink);
    return () => this.sinks.delete(sink);
  }

  removeSink(sink: LogSink): void {
    this.sinks.delete(sink);
  }

  clearSinks(): void {
    this.sinks.clear();
  }

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

  debug(component: LogComponent, message: string, data?: Record<string, unknown>): void {
    this.log("debug", component, message, data);
  }

  info(component: LogComponent, message: string, data?: Record<string, unknown>): void {
    this.log("info", component, message, data);
  }

  warn(component: LogComponent, message: string, data?: Record<string, unknown>): void {
    this.log("warn", component, message, data);
  }

  error(
    component: LogComponent,
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>,
  ): void {
    const serializedError = this.serializeError(error);
    this.log("error", component, message, {
      ...data,
      ...(serializedError ? { error: serializedError } : {}),
    });
  }

  atFrame(
    frame: number,
    level: LogLevel,
    component: LogComponent,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    this.log(level, component, message, { ...data, frame });
  }

  private log(
    level: LogLevel,
    component: LogComponent,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.minLevel]) {
      return;
    }

    if (this.config.components.length > 0 && !this.config.components.includes(component)) {
      return;
    }

    const entry: LogEntry = {
      id: ++this.idCounter,
      level,
      component,
      message,
      data,
      timestamp: this.config.clock?.() ?? 0,
      frame: extractFrame(data),
      event: extractStringField(data, "event"),
      jobId: extractStringField(data, "jobId"),
      episodeId: extractStringField(data, "episodeId"),
      sourceSignature: extractStringField(data, "sourceSignature"),
      error: extractError(data),
    };

    if (this.config.consoleOutput) {
      createConsoleLogSink(this.config).onLog(entry);
    }

    for (const sink of this.sinks) {
      try {
        sink.onLog(entry);
      } catch {
        // Keep logging non-fatal.
      }
    }

    for (const subscriber of this.subscribers) {
      try {
        subscriber.onLog(entry);
      } catch {
        // Keep logging non-fatal.
      }
    }
  }

  private serializeError(error: Error | unknown): LogEntry["error"] | undefined {
    if (!error) {
      return undefined;
    }

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.config.includeStackTraces ? error.stack : undefined,
      };
    }

    return {
      name: "UnknownError",
      message: String(error),
    };
  }
}

export class LogCollector implements LogSink {
  protected entries: LogEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries = 10000) {
    this.maxEntries = maxEntries;
  }

  onLog(entry: LogEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  flush(): LogEntry[] {
    const result = [...this.entries];
    this.entries = [];
    return result;
  }

  peek(): readonly LogEntry[] {
    return this.entries;
  }

  getByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter((entry) => entry.level === level);
  }

  getByComponent(component: LogComponent): LogEntry[] {
    return this.entries.filter((entry) => entry.component === component);
  }

  getByFrameRange(startFrame: number, endFrame: number): LogEntry[] {
    return this.entries.filter(
      (entry) => entry.frame !== undefined && entry.frame >= startFrame && entry.frame <= endFrame,
    );
  }

  getErrors(): LogEntry[] {
    return this.getByLevel("error");
  }

  getIssues(): LogEntry[] {
    return this.entries.filter((entry) => entry.level === "warn" || entry.level === "error");
  }

  hasErrors(): boolean {
    return this.entries.some((entry) => entry.level === "error");
  }

  getCounts(): Record<LogLevel, number> {
    return {
      debug: this.entries.filter((entry) => entry.level === "debug").length,
      info: this.entries.filter((entry) => entry.level === "info").length,
      warn: this.entries.filter((entry) => entry.level === "warn").length,
      error: this.entries.filter((entry) => entry.level === "error").length,
    };
  }

  toJSON(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  clear(): void {
    this.entries = [];
  }
}

export class MemoryLogSink extends LogCollector {}

let defaultLogger: TokovoLogger | null = null;

export function getLogger(): TokovoLogger {
  defaultLogger ??= new TokovoLogger(configureLoggerFromEnv());
  return defaultLogger;
}

export function setLogger(logger: TokovoLogger): void {
  defaultLogger = logger;
}

export function createLogger(config: Partial<LoggerConfig> = {}): TokovoLogger {
  return new TokovoLogger(config);
}

export function createScopedLogger(
  component: LogComponent,
  logger: TokovoLogger = getLogger(),
  baseData?: Record<string, unknown>,
): ScopedLogger {
  const mergeData = (data?: Record<string, unknown>): Record<string, unknown> | undefined => {
    if (!baseData) {
      return data;
    }

    if (!data) {
      return { ...baseData };
    }

    return { ...baseData, ...data };
  };

  return {
    debug: (message: string, data?: Record<string, unknown>) =>
      logger.debug(component, message, mergeData(data)),
    info: (message: string, data?: Record<string, unknown>) =>
      logger.info(component, message, mergeData(data)),
    warn: (message: string, data?: Record<string, unknown>) =>
      logger.warn(component, message, mergeData(data)),
    error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) =>
      logger.error(component, message, error, mergeData(data)),
    atFrame: (frame: number, level: LogLevel, message: string, data?: Record<string, unknown>) =>
      logger.atFrame(frame, level, component, message, mergeData(data)),
    withContext: (data: Record<string, unknown>) =>
      createScopedLogger(component, logger, mergeData(data)),
  };
}

const runtimeEngineLog = createScopedLogger("engine");
const runtimeAudioLog = createScopedLogger("audio");

export function logEngineEvent(kind: string, type: string, frame: number): void {
  runtimeEngineLog.atFrame(frame, "debug", `Processed ${kind}:${type}`, {
    event: "engine.event",
    kind,
    type,
  });
}

export function logEnginePerf(label: string, ms: number): void {
  runtimeEngineLog.debug(`${label} took ${ms.toFixed(2)}ms`, {
    event: "engine.perf",
    label,
    durationMs: ms,
  });
}

export function logEngineWarn(message: string, data?: Record<string, unknown>): void {
  runtimeEngineLog.warn(message, {
    event: "engine.warn",
    ...(data ?? {}),
  });
}

export function logEngineError(
  message: string,
  error?: Error | unknown,
  data?: Record<string, unknown>,
): void {
  runtimeEngineLog.error(message, error, {
    event: "engine.error",
    ...(data ?? {}),
  });
}

export function logAudioPolicyDrop(event: PolicyDropEvent): void {
  runtimeAudioLog.atFrame(event.frame, "info", `Dropped audio cue ${event.soundId}`, {
    event: "audio.policy_drop",
    soundId: event.soundId,
    bus: event.bus,
    reason: event.reason,
    alternateSound: event.alternateSound,
    replacedBy: event.replacedBy,
  });
}

export function logAudioSoundPathFallback(soundId: string, resolvedPath: string): void {
  runtimeAudioLog.warn(`Unregistered sound "${soundId}" used fallback path`, {
    event: "audio.sound_path_fallback",
    soundId,
    resolvedPath,
  });
}

export function logAudioPlay(soundId: string, bus: string, frame: number): void {
  runtimeAudioLog.atFrame(frame, "debug", `Playing ${soundId} on ${bus}`, {
    event: "audio.play",
    soundId,
    bus,
  });
}

export function logAudioStop(soundId: string, frame: number): void {
  runtimeAudioLog.atFrame(frame, "debug", `Stopping ${soundId}`, {
    event: "audio.stop",
    soundId,
  });
}

export function logAudioCrossfade(
  from: string,
  to: string,
  durationFrames: number,
  frame: number,
): void {
  runtimeAudioLog.atFrame(frame, "debug", `Crossfading ${from} to ${to}`, {
    event: "audio.crossfade",
    from,
    to,
    durationFrames,
  });
}

export function logAudioDucking(
  targetBus: string,
  duckAmount: number,
  sourceBus: string,
  frame: number,
): void {
  runtimeAudioLog.atFrame(frame, "debug", `Ducking ${targetBus}`, {
    event: "audio.ducking",
    targetBus,
    duckAmount,
    sourceBus,
  });
}
