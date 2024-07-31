import MethodParameter from '../MethodParameter';
import ServletContext from '../../http/ServletContext';
import ModelAndViewContainer from '../../models/ModelAndViewContainer';

export default interface HandlerMethodReturnValueHandler {

  /**
   * 是否支持处理当前返回值
   * @param returnType
   */
  supportsReturnType(returnType: MethodParameter): boolean

  /**
   * 处理当前返回值
   * @param returnValue 返回值
   * @param returnType 返回值参数类型
   * @param servletContext 请求上下文
   */
  handleReturnValue(returnValue: any, returnType: MethodParameter, servletContext: ServletContext, mavContainer: ModelAndViewContainer): Promise<void>
}
