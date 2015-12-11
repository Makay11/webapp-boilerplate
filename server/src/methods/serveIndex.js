"use strict";

module.exports = function (req, res) {
  res.sendFile(process.cwd() + "/client/dist/app/index.html");
};
