import Locale from "../../locale/Locale";
import DateTimeTextProvider from "./DateTimeTextProvider";

export const padZero = (num: number, count: number) => {
  let v = num.toString();
  for (let i = 0, k = count - v.length; i < k; i++) {
    v = '0' + v;
  }
  return v;
}

export const checkLimit = (exp: string, max: number) => {
  if (exp.length > max) {
    throw new Error(`Too many pattern letters: ${exp[0]}`);
  }
}

// 最小单位格式化器
export default {
  // 年
  'y': (date: Date, exp: string, locale: Locale) => {
    const year = date.getFullYear();
    return exp == 'yy' ? year.toString().slice(-2) : padZero(year, exp.length);
  },
  // 月 MM:不足两位补0  M:不补0 MMM 简写  MMMM 全写
  'M': (date: Date, exp: string, locale: Locale) => {
    checkLimit(exp, 4);
    const month = date.getMonth();
    if (exp.length < 3) {
      return padZero((month + 1), exp.length);
    }
    return DateTimeTextProvider.getMonth(month, locale, exp.length > 3);
  },
  // 日 dd:不足两位补0  d:不补0
  'd': (date: Date, exp: string, locale: Locale) => {
    checkLimit(exp, 2);
    // d dd
    return padZero(date.getDate(), exp.length);
  },
  // 小时(24小时制) HH:不足两位补0   H:不补0
  'H': (date: Date, exp: string, locale: Locale) => {
    checkLimit(exp, 2);
    return padZero(date.getHours(), exp.length);
  },
  // 小时(12小时制) hh:不足两位补0   h:不补0
  'h': (date: Date, exp: string, locale: Locale) => {
    checkLimit(exp, 2);
    return padZero(date.getHours() % 12 || 12, exp.length);
  },
  // 分钟 mm:不足两位补0   m:不补0
  'm': (date: Date, exp: string, locale: Locale) => {
    checkLimit(exp, 2);
    return padZero(date.getMinutes(), exp.length);
  },
  // 秒  ss:不足两位补0   s:不补0
  's': (date: Date, exp: string, locale: Locale) => {
    checkLimit(exp, 2);
    return padZero(date.getSeconds(), exp.length);
  },
  // 毫秒 S SS SSS 根据配置返回对应的毫秒位数
  'S': (date: Date, exp: string, locale: Locale) => {
    return date.getMilliseconds().toString().slice(0, exp.length)
  },
  // 季度
  'q': (date: Date) => Math.floor((date.getMonth() + 3) / 3).toString(),
  // 星期
  'E': (date: Date, exp: string, locale: Locale) => {
    checkLimit(exp, 4);
    return DateTimeTextProvider.getWeek(date.getDay(), locale, exp.length === 4)
  },
  // 上午下午
  'a': (date: Date, exp: string, locale: Locale) => {
    checkLimit(exp, 5);
    return DateTimeTextProvider.getPAM(date.getHours(), locale)
  },
  // 时区偏移量
  'Z': (date: Date, exp: string, locale: Locale) => {
    checkLimit(exp, 5);
    let offsetMinutes = date.getTimezoneOffset();
    let sign = offsetMinutes < 0 ? '+' : '-';
    offsetMinutes = Math.abs(offsetMinutes);
    let hours = Math.floor(offsetMinutes / 60);
    let minutes = offsetMinutes % 60;
    return `${sign}${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
  },
}