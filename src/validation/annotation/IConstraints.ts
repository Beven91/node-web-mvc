import { ValidateGroupType } from './Validated';

export default interface IConstraints {
  groups?: ValidateGroupType | ValidateGroupType[];

  /**
   * 自定义验证失败时的提示消息
   */
  message?: string;
}
