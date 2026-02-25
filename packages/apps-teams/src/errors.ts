export class TeamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TeamsError";
  }
}

export class TeamsDslError extends TeamsError {
  constructor(message: string) {
    super(message);
    this.name = "TeamsDslError";
  }
}

export class TeamsLoweringError extends TeamsError {
  constructor(message: string) {
    super(message);
    this.name = "TeamsLoweringError";
  }
}
