const express = require('express');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const bookRouter = require('./routes/bookRoutes');
const searchRouter = require('./routes/searchRoutes');

const app = express();

app.use(express.json({ limit: '10kb' }));

// request logging during development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/search', searchRouter);

// handle all requests to urls that do not exist
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
