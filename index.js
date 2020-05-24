const Controller = require('./src/controller');
const AreaRegistration = require('./src/areaRegistration');
const RouteCollection = require('./src/RouteCollection');
const ControllerFactory = require('./src/ControllerFactory');
const Registry = require('./src/Registry.js');
const RequestMapping = require('./src/annotations/RequestMapping');
const PostMapping = require('./src/annotations/PostMapping');
const RestController = require('./src/annotations/RestController');
const Scope = require('./src/annotations/Scope');

module.exports = {
  Controller: Controller,
  ControllerFactory: ControllerFactory,
  AreaRegistration: AreaRegistration,
  Routes: RouteCollection,
  Registry: Registry,
  PostMapping:PostMapping,
  RequestMapping: RequestMapping,
  RestController: RestController,
  Scope: Scope
}