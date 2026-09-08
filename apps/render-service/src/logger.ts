import {
  configureLoggerFromEnv,
  createLogger,
  createScopedLogger,
  type TokovoLogger,
} from "@tokovo/core";
import { createNdjsonFileSink } from "@tokovo/core/logger/node";

function shouldUseConsoleFromEnv(): boolean {
  return (
    process.env.TOKOVO_LOG_CONSOLE !== undefined ||
    process.env.TOKOVO_LOG_PROFILE === "operator" ||
    process.env.TOKOVO_LOG_PROFILE === "full"
  );
}

export interface RenderProgressEvent {
  readonly level: "info" | "warn" | "error";
  readonly event: string;
  readonly message: string;
  readonly data?: Readonly<Record<string, unknown>>;
}

export class RenderLogger {
  #logger: TokovoLogger;
  #log: ReturnType<typeof createScopedLogger>;
  #sinkPath: string;
  #onProgress?: (
    event: RenderProgressEvent,
  ) => void | Promise<void>;

  constructor(
    filePath: string,
    baseData: Record<string, unknown> = {},
    onProgress?: (
      event: RenderProgressEvent,
    ) => void | Promise<void>,
  ) {
    const sinkPath = process.env.TOKOVO_LOG_PATH ?? filePath;
    this.#sinkPath = sinkPath;
    const loggerConfig = configureLoggerFromEnv(process.env);
    this.#logger = createLogger({
      ...loggerConfig,
      consoleOutput: shouldUseConsoleFromEnv() ? loggerConfig.consoleOutput : false,
    });
    this.#logger.addSink(createNdjsonFileSink(sinkPath));
    this.#log = createScopedLogger("render-service", this.#logger).withContext(baseData);
    this.#onProgress = onProgress;
  }

  async init(): Promise<void> {
    this.#log.debug("Initialized render logger", {
      event: "render.logger.init",
      logPath: this.#sinkPath,
    });
  }

  async log(
    level: "info" | "warn" | "error",
    event: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const payload = {
      event,
      ...(data ?? {}),
    };

    if (level === "info") {
      this.#log.info(message, payload);
    } else if (level === "warn") {
      this.#log.warn(message, payload);
    } else {
      this.#log.error(message, undefined, payload);
    }

    await this.#onProgress?.({
      level,
      event,
      message,
      data,
    });
  }

  async info(event: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log("info", event, message, data);
  }

  async warn(event: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log("warn", event, message, data);
  }

  async error(event: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log("error", event, message, data);
  }
}
