"use strict";

module.exports = {
  url: "/",
  template: require("./view"),
  controller: controller,
  controllerAs: "vm"
};

/*@ngInject*/
function controller($scope) {
  var vm = this;

  vm.title = "Hello, world!";
}
