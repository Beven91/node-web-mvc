import { ControllerAdvice, ExceptionHandler, ResponseBody } from '../../../src/index';

@ControllerAdvice
export default class GlobalException {

  @ResponseBody
  @ExceptionHandler
  handleException(ex) {
    // console.error(ex);
    return { code: 99, message: ex.message, reason: 'global handle' }
  }
}