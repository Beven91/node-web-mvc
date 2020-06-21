/**
 * @module RequestImplicitParams
 * @description 配置指定接口指定位置参数提取信息
 */
import ControllerManagement from '../../../ControllerManagement';
import MethodParameter from '../../../interface/MethodParameter';
import { ActionDescriptors } from '../../../interface/declare';
import ApiImplicitParams from '../../../swagger/annotations/ApiImplicitParams';

/**
 * 配置指定接口函数，指定位置参数的提取策略
 */
export default function RequestParams(params: Array<MethodParameter>) {
  return (target, name) => {
    const descriptor = ControllerManagement.getControllerDescriptor(target.constructor);
    const action = descriptor.actions[name] = descriptor.actions[name] || ({} as ActionDescriptors);
    action.params = params.map((value) => new MethodParameter(value));

    // 执行swagger注册
    ApiImplicitParams(
      params.map((param)=>{
        return {
          name:param.value,
          value:param.desc,
          dataType:param.dataType ? param.dataType.name : '',
          paramType:param.paramType
        }
      })
    );
  }
}