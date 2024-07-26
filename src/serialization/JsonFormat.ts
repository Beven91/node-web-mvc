import Locale from '../locale/Locale';
import Target from '../servlets/annotations/Target';
import ElementType from '../servlets/annotations/annotation/ElementType';

class JsonFormat {
  pattern: string;

  locale?: Locale;
}

/**
 * 标记指定的类或者指定字段或者指定参数
 * 在序列化或者反序列化时格式
 */
export default Target([ ElementType.TYPE, ElementType.PROPERTY, ElementType.PARAMETER ])(JsonFormat);
