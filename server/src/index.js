"use strict";

global.config = require("../../config");

Promise = require("bluebird");

Promise.config({
  warnings: false,
  longStackTraces: false
});

global._ = require("lodash");

const express = require("express");
const app = express();

app.db = require("./db");
app.methods = require("require-dir")("./methods");

app.use(require("cors")());
app.use(require("helmet")());
app.use(require("compression")());
app.use(require("body-parser").json());
app.use(require("body-parser").urlencoded({extended: true}));

require("./routes")(app);

app.use(function (err, req, res, next) {
  if (err.isBoom) {
    if (!res.headersSent) res.status(err.output.statusCode).json(err.output.payload);
  }
  else if (process.env.NODE_ENV !== "development") { // production error handler
    if (!res.headersSent) res.sendStatus(500);
  }
  else { // development error handler (default)
    next(err);
  }
});

const server = app.listen(config.port || 6900, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Server listening at http://%s:%s", host, port);
});
