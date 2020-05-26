const Controller = require('./src/controller');
const AreaRegistration = require('./src/areaRegistration');
const RouteCollection = require('./src/RouteCollection');
const ControllerFactory = require('./src/ControllerFactory');
const Registry = require('./src/Registry.js');
const RequestMapping = require('./src/annotations/RequestMapping');
const PostMapping = require('./src/annotations/PostMapping');
const RestController = require('./src/annotations/RestController');
const Scope = require('./src/annotations/Scope');
const ControllerAdvice = require('./src/annotations/ControllerAdvice');
const ExceptionHandler = require('./src/annotations/ExceptionHandler');

module.exports = {
  Registry: Registry,
  Controller: Controller,
  ControllerFactory: ControllerFactory,
  AreaRegistration: AreaRegistration,
  Routes: RouteCollection,
  RestController: RestController,
  Scope: Scope,
  PostMapping: PostMapping,
  RequestMapping: RequestMapping,
  ControllerAdvice: ControllerAdvice,
  ExceptionHandler: ExceptionHandler
}