export class ServiceResponse<T = undefined> {
  public data?: T;
  public message?: string;
  public isError?: boolean;
  constructor(data?: T, message?: string, isError = false) {
    this.data = data;
    this.message = message;
    this.isError = isError;
  }
}

export class ServiceErrorResponse<T = undefined> extends ServiceResponse<T> {
  public message?: string;

  constructor(message: string) {
    super(undefined, message, true);
  }
}
