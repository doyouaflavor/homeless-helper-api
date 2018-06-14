const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const { createError } = require('./lib/utils');
const routes = require('./routes');

const PORT = 5000
const isProduction = process.env.NODE_ENV === 'production';

const app = express();

// Cross origin.
app.use(cors());

// Logger.
if (isProduction) {
  app.use(morgan('common'));
} else {
  app.use(morgan('dev'));
}

// Body parse.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Add custom routes.
app.use(routes);

/// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
  next(createError(404, 'Not found'));
});

if (!isProduction) {
  // Development error handler.
  // It will print stacktrace.
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.send({
      error: {
        message: err.message,
        error: err,
      },
    });
  });
} else {
  // Production error handler.
  // No stacktraces leaked to user.
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    res.send({
      error: {
        message: err.message,
      },
    });
  });
}


// Start the server.
app.listen(PORT, (err) => {
  if (err) {
    console.error(err)
  } else {
    console.info(`==> Listening on port ${PORT}`)
  }
})
