import { JsonSerializer } from 'node-web-mvc';
import Color from '../models/Color';


export default class ColorSerializer extends JsonSerializer {
  serialize(data:Color): string {
    return `#${data.r.toString(16)}${data.g.toString(16)}${data.b.toString(16)}`;
  }
}
