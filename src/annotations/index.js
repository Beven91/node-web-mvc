const Scope = require('./annotations/Scope');
const RequestMapping = require('./annotations/RequestMapping');
const PostMapping = require('./annotations/PostMapping');
const ControllerAdvice = require('./annotations/ControllerAdvice');
const ExceptionHandler = require('./annotations/ExceptionHandler');

module.exports = {
  Scope: Scope,
  PostMapping: PostMapping,
  RequestMapping: RequestMapping,
  ControllerAdvice: ControllerAdvice,
  ExceptionHandler: ExceptionHandler
}