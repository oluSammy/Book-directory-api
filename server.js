const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

process.on('unhandledRejection', (err) => {
  console.log('unhandled rejection, shutting down');
  console.log(err.name, err.message, err);
});

// connect to db
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('🦾  DB connection  Successful');
  });

const port = 3001 || process.env.PORT;

// Start Server
const server = app.listen(port, () => {
  console.log(`🤝 Server fired 🔥 up on port ${port}`);
});

process.on('uncaughtException', (err) => {
  console.log('uncaught exception, shutting down');
  console.log(err.name, err.message, err);
  server.close(() => {
    process.exit(1);
  });
});
