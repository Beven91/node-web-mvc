const Controller = require('./src/controller');
const AreaRegistration = require('./src/areaRegistration');
const RouteCollection = require('./src/RouteCollection');
const ControllerFactory = require('./src/ControllerFactory');
const Registry = require('./src/Registry.js');

module.exports = {
  Controller: Controller,
  ControllerFactory: ControllerFactory,
  AreaRegistration: AreaRegistration,
  Routes: RouteCollection,
  Registry: Registry
}