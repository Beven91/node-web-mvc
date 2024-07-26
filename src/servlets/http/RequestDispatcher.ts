import type HttpServletRequest from './HttpServletRequest';
import type HttpServletResponse from './HttpServletResponse';

export interface RequestDispatcher {

  forward(request: HttpServletRequest, response: HttpServletResponse): Promise<void>

}
