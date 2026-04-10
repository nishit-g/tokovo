import fs from 'node:fs/promises'
import path from 'node:path'

export type RenderLogLevel = 'info' | 'warn' | 'error'

export type RenderLogEntry = {
  at: string
  level: RenderLogLevel
  event: string
  message: string
  data?: Record<string, unknown>
}

export class RenderLogger {
  #filePath: string

  constructor(filePath: string) {
    this.#filePath = filePath
  }

  async init(): Promise<void> {
    await fs.mkdir(path.dirname(this.#filePath), { recursive: true })
    await fs.writeFile(this.#filePath, '', 'utf8')
  }

  async log(
    level: RenderLogLevel,
    event: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const entry: RenderLogEntry = {
      at: new Date().toISOString(),
      level,
      event,
      message,
      ...(data ? { data } : {}),
    }
    await fs.appendFile(this.#filePath, `${JSON.stringify(entry)}\n`, 'utf8')
  }

  async info(event: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log('info', event, message, data)
  }

  async warn(event: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log('warn', event, message, data)
  }

  async error(event: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log('error', event, message, data)
  }
}
