import Locale from "../../locale/Locale";
import DateTimeTextProvider from "./DateTimeTextProvider";
import { checkLimit } from "./formatters";

// 最小单位解析器
export default {
  // 年
  'y': (raw: string, exp: string, locale: Locale) => {
    const count = (exp.length == 1 || exp.length == 3) ? 4 : exp.length;
    return raw.length == count ? raw : null;
  },
  // 月 MM:不足两位补0  M:不补0 MMM 月份简写 MMMM: 月份完整名称
  'M': (raw: string, exp: string, locale: Locale) => {
    checkLimit(exp, 4);
    if (exp.length < 3) {
      return raw.length == exp.length ? raw : null;
    }
    return DateTimeTextProvider.findMonth(raw, locale, exp.length > 3);
  },
  // 日 dd:不足两位补0  d:不补0
  'd': (raw: string, exp: string, locale: Locale) => {
    checkLimit(exp, 2);
    return raw.length == exp.length ? raw : null;
  },
  // 小时(24小时制) HH:不足两位补0   H:不补0
  'H': (raw: string, exp: string, locale: Locale) => {
    checkLimit(exp, 2);
    return raw.length == exp.length ? raw : null;
  },
  // 小时(12小时制) hh:不足两位补0   h:不补0
  'h': (raw: string, exp: string, locale: Locale) => {
    checkLimit(exp, 2);
    return raw.length == exp.length ? raw : null;
  },
  // 分钟 mm:不足两位补0   m:不补0
  'm': (raw: string, exp: string, locale: Locale) => {
    checkLimit(exp, 2);
    return raw.length == exp.length ? raw : null;
  },
  // 秒  ss:不足两位补0   s:不补0
  's': (raw: string, exp: string, locale: Locale) => {
    checkLimit(exp, 2);
    return raw.length == exp.length ? raw : null;
  },
  // 毫秒 S SS SSS 根据配置返回对应的毫秒位数
  'S': (raw: string, exp: string, locale: Locale) => {
    return raw.length == exp.length ? raw : null;
  },
  // 星期
  'E': (raw: string, exp: string, locale: Locale) => {
    return DateTimeTextProvider.findWeek(raw, locale, exp.length > 3);
  },
  // 上下午
  'a': (raw: string, exp: string, locale: Locale) => {
    return DateTimeTextProvider.findPAM(raw, locale);
  },
  'Z': (raw: string, exp: string, locale: Locale) => {
    if (raw.length === 5) {
      const symbol = raw[0];
      const hour = parseInt(raw.slice(1, 3));
      const minutes = parseInt(raw.slice(3, 5));
      const allMinutes = hour * 60 + minutes;
      return symbol == '+' ? -allMinutes : allMinutes;
    }
    return null;
  }
}