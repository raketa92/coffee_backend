export class ApplicationError extends Error {
  public readonly name: string;
  public readonly statusCode: string;
  public readonly httpStatusCode: number;
  constructor(
    name: string,
    statusCode: string,
    httpStatusCode: number,
    message: string
  ) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.httpStatusCode = httpStatusCode;
  }
}
