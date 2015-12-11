"use strict";

var app = angular.module("app", ["ui.router", "ngMaterial"]);

app.config(function ($locationProvider, $urlRouterProvider, $stateProvider) {
  $locationProvider.html5Mode(true);

  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state("home", require("./states/home"))
    ;
});
