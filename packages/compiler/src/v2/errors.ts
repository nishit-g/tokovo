export class CompilerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompilerError";
  }
}

export class CompilerSchemaValidationError extends CompilerError {
  constructor(message: string) {
    super(message);
    this.name = "CompilerSchemaValidationError";
  }
}

export class PluginLowererMissingError extends CompilerError {
  constructor(public readonly appId: string) {
    super(`No plugin lowerer registered for appId: ${appId}`);
    this.name = "PluginLowererMissingError";
  }
}

export class RuntimeValidationError extends CompilerError {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeValidationError";
  }
}
