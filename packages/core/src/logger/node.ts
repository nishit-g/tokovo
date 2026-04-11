import fs from "node:fs";
import path from "node:path";

import type { LogEntry, LogSink } from "./index.js";

export class NdjsonFileSink implements LogSink {
  constructor(
    private readonly filePath: string,
    options: { truncate?: boolean } = {},
  ) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (options.truncate !== false) {
      fs.writeFileSync(filePath, "", "utf8");
    }
  }

  onLog(entry: LogEntry): void {
    fs.appendFileSync(this.filePath, `${JSON.stringify(entry)}\n`, "utf8");
  }
}

export function createNdjsonFileSink(
  filePath: string,
  options: { truncate?: boolean } = {},
): LogSink {
  return new NdjsonFileSink(filePath, options);
}
