export class CinematicAuthoringError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CinematicAuthoringError";
    this.code = code;
  }
}
