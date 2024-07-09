import Locale from "../../locale/Locale";
import formatters from "./formatters";
import parsers from "./parsers";
import './locale';

const patternRegexp = /(y+|M+|d+|h+|H+|m+|s+|S+|E+|q|a|Z)/g;
type FormatterTypes = keyof typeof formatters;
type ParserTypes = keyof typeof parsers;

export default class DateConverter {

  private readonly pattern: string
  private readonly locale: Locale

  constructor(pattern: string, locale?: Locale) {
    this.pattern = pattern;
    this.locale = locale;
  }

  /**
   * 根据指定格式将字符串解析成日期对象
   * @param raw 日期字符串
   * @param pattern 日期格式
   * @returns 
   */
  parse(raw: string): Date {
    if (!raw) return null;
    const record = {} as Record<ParserTypes, string>;
    const expressions = this.pattern.replace(patternRegexp, (match: string) => `\n${match}\n`).split('\n').filter((m) => m !== '').map((m) => m.replace(/'/g, ''))
    let readValue = '';
    let expIndex = 0;
    // 提取出单元顺序
    // 逐个读取字符
    for (let i = 0, k = raw.length; i < k; i++) {
      readValue += raw[i];
      const exp = expressions[expIndex];
      const key = exp?.[0];
      const handler = parsers[key as ParserTypes];
      const v = handler?.(readValue, exp, this.locale);
      if (v || readValue === exp) {
        v && (record[key] = v);
        readValue = '';
        expIndex++;
      }
    }
    const startYear = 1970;
    const year = parseInt(record.y || startYear.toString());
    const month = (parseInt(record.M || '1') - 1)
    const day = parseInt(record.d || '1');
    const hours = parseInt(record.h || record.H || '0');
    const minutes = parseInt(record.m || '0');
    const seconds = parseInt(record.s || '0');
    const millseconds = parseInt(record.S || '0');
    const zone = parseInt(record.Z || '0');
    const pam = parseInt(record.a || '-1');
    let date = new Date(year, month, day, hours, minutes, seconds, millseconds);
    const offset = zone ? date.getTimezoneOffset() - zone : 0;
    if(pam == 1) {
      // 根据上下午 推敲小时
      date.setHours(date.getHours() + 12);
    }
    if (offset !== 0) {
      // 补充时差计算
      const time = date.getTime() - offset * 60000;
      date = new Date(time);
    }
    if(!record.d && record.E) {
      console.log('RecorE',record.E, date.getDay());
      // 在没有日期场景下，根据星期来设置日期
      const offset = parseInt(record.E) - date.getDay();
      const isStartYear = year == startYear && month == 0;
      const offsetDay = isStartYear ? 7 - date.getDay() + parseInt(record.E) : offset;
      date = new Date(date.getTime() + offsetDay * 24 * 60 * 60 * 1000);
    }
    return date;
  };

  /**
   * 将日期对象格式化成指定格式的字符串
   * @param date 日期对象
   * @param pattern 日期格式
   * @returns 
   */
  format(date: Date) {
    return this.pattern.replace(patternRegexp, (match) => {
      const handler = formatters[match[0] as FormatterTypes];
      return handler ? handler(date, match, this.locale) : match;
    }).replace?.(/'/g, '');
  }
}

const examples = [
  'yyyy-MM-dd',
  'dd/MM/yyyy',
  'MM/dd/yyyy',
  'HH:mm:ss',
  'hh:mm a',
  'yyyy-MM-dd HH:mm:ss',
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
  "EEEE, MMMM d, yyyy",
  "MM/dd/yyyy HH:mm Z",
  "EEEE",
  "MMddyyyy",
  "MMMMddyyyy"
]

const exp = [
  "2024-07-09",
  "09/07/2024",
  "07/09/2024",
  "14:27:17",
  "02:27 下午",
  "2024-07-09 14:27:17",
  "2024-07-09T14:27:17",
  "2024-07-09T14:27:17.801+0800",
  "星期二, 七月 9, 2024",
  "07/09/2024 14:27 +0800",
  "星期二",
  "07092024",
  "七月092024"
]
const date = new Date();
// const results = [];

// examples.forEach((m, i) => {
//   const converter = new DateConverter(m, Locale.SIMPLIFIED_CHINESE);
//   const value = converter.format(date);
//   console.log(m, ':', value);
//   results.push(value);
// })
// console.log(JSON.stringify(results,null,2));


examples.forEach((example, i) => {
  const converter = new DateConverter(example, Locale.SIMPLIFIED_CHINESE);
  console.log(i, example, exp[i], converter.parse(exp[i]).toLocaleString());
})