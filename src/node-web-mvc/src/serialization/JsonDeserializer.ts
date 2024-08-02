import { ClazzType } from '../interface/declare';

export default abstract class JsonDeserializer {
  abstract deserialize(raw: any, clazz: ClazzType, name: string): any;
}
