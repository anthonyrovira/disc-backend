// not used so far
// just in case we need a custom error response
export class NotFoundException extends Error {
  statusCode: number;
  message: string;

  constructor(message: string) {
    super();
    this.statusCode = 404;
    this.message = message;
  }
}
