import { ControllerAdvice, ExceptionHandler, ResponseBody, RestController } from 'node-web-mvc';

@ControllerAdvice
export default class GlobalException {
  @ResponseBody
  @ExceptionHandler
  handleException(ex) {
    console.error(ex);
    return { code: 99, message: ex.message, reason: 'global handle' };
  }
}
