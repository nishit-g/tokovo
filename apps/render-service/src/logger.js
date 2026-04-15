import { configureLoggerFromEnv, createLogger, createScopedLogger, } from "@tokovo/core";
import { createNdjsonFileSink } from "@tokovo/core/logger/node";
export class RenderLogger {
    #logger;
    #log;
    #sinkPath;
    constructor(filePath, baseData = {}) {
        const sinkPath = process.env.TOKOVO_LOG_PATH ?? filePath;
        this.#sinkPath = sinkPath;
        this.#logger = createLogger(configureLoggerFromEnv(process.env));
        this.#logger.addSink(createNdjsonFileSink(sinkPath));
        this.#log = createScopedLogger("render-service", this.#logger).withContext(baseData);
    }
    async init() {
        this.#log.debug("Initialized render logger", {
            event: "render.logger.init",
            logPath: this.#sinkPath,
        });
    }
    async log(level, event, message, data) {
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
    async info(event, message, data) {
        await this.log("info", event, message, data);
    }
    async warn(event, message, data) {
        await this.log("warn", event, message, data);
    }
    async error(event, message, data) {
        await this.log("error", event, message, data);
    }
}
