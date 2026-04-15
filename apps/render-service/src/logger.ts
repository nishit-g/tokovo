import {
  configureLoggerFromEnv,
  createLogger,
  createScopedLogger,
  type TokovoLogger,
} from "@tokovo/core";
import { createNdjsonFileSink } from "@tokovo/core/logger/node";

export class RenderLogger {
  #logger: TokovoLogger;
  #log: ReturnType<typeof createScopedLogger>;
  #sinkPath: string;

  constructor(filePath: string, baseData: Record<string, unknown> = {}) {
    const sinkPath = process.env.TOKOVO_LOG_PATH ?? filePath;
    this.#sinkPath = sinkPath;
    this.#logger = createLogger(configureLoggerFromEnv(process.env));
    this.#logger.addSink(createNdjsonFileSink(sinkPath));
    this.#log = createScopedLogger("render-service", this.#logger).withContext(baseData);
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
      return;
    }

    if (level === "warn") {
      this.#log.warn(message, payload);
      return;
    }

    this.#log.error(message, undefined, payload);
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
