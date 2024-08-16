import { JsonDeserializer } from 'node-web-mvc';
import Color from '../models/Color';

export default class ColorDeserializer extends JsonDeserializer {
  deserialize(value: string): Color {
    const hex = String(value).split('#').pop();
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return new Color(r, g, b);
  }
}
