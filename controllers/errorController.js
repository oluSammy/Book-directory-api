const sendErrDev = (err, res) => {
  res.status(`${err.statusCode}`).json({
    status: err.status,
    message: err.message,
    error: err,
    errorStack: err.errorStack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  }

  next();
};
