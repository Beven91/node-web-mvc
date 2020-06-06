import { ControllerAdvice, ExceptionHandler } from '../../index';

@ControllerAdvice
export default class GlobalException {

  @ExceptionHandler()
  handleException(ex) {
    return JSON.stringify({ code: 99, message: ex.message, reason: 'global handle' })
  }
}