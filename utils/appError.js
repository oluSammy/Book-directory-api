// sets a base class for error handling in my app

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('404') ? 'fail' : 'error';
    this.isOperational = true;

    // this ~ the location in the code where the error was called
    // exclude current function from stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
