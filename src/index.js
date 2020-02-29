const Controller = require('./controller');
const AreaRegistration = require('./areaRegistration');
const RouteCollection = require('./RouteCollection');
const ControllerFactory = require('./ControllerFactory');
const Registry = require('./Registry.js');

module.exports = {
  Controller: Controller,
  ControllerFactory: ControllerFactory,
  AreaRegistration: AreaRegistration,
  Routes: RouteCollection,
  Registry: Registry
}