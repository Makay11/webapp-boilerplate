"use strict";

const express = require("express");

module.exports = function (app) {

  const handlers = require("require-dir")("./handlers");

  const serveIndex = app.methods.serveIndex;


  app.use(express.static("client/dist"));

  app.all("/api/test", handlers["test"]);

  app.all("/api/*", function (req, res) {
    if (!res.headersSent) res.sendStatus(404);
  });

  app.get("/*", serveIndex);

};
