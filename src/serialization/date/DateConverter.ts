import DateTimeParseException from "../../errors/DateTimeParseException";
import InvalidDateTimeFormatException from "../../errors/InvalidDateTimeFormatException";
import Locale from "../../locale/Locale";
import formatters from "./formatters";
import parsers, { getNormalDay } from "./parsers";

const patternRegexp = /(y+|M+|d+|h+|H+|m+|s+|S+|E+|L+|q|a|Z|w|W)/g;
const alias = {
  'L': 'M'
}
type FormatterTypes = keyof typeof formatters;
type ParserTypes = keyof typeof parsers;

export default class DateConverter {

  private readonly pattern: string
  private readonly locale: Locale

  constructor(pattern: string, locale?: Locale) {
    this.pattern = pattern;
    this.locale = locale || Locale.ENGLISH;
  }

  static of(pattern: string, locale?: Locale) {
    return new DateConverter(pattern, locale);
  }

  private getExpression(expressions: string[], index: number) {
    const exp = expressions[index];
    const key = alias[exp?.[0]] || exp?.[0];
    return {
      exp: exp || '',
      key,
      handler: parsers[key as ParserTypes]
    }
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
    let current = this.getExpression(expressions, expIndex);
    let next = this.getExpression(expressions, expIndex + 1);
    for (let i = 0, k = raw.length; i < k; i++) {
      readValue += raw[i];
      const exp = current.exp;
      const key = current.key;
      const splitChar = next.exp[0];
      const isSatisfy = next.handler ? true : splitChar == raw[i + 1];
      const v = current.handler?.(readValue, exp, this.locale);
      if ((v && isSatisfy) || readValue === exp) {
        v && (record[key] = v);
        readValue = '';
        expIndex++;
        current = this.getExpression(expressions, expIndex);
        next = this.getExpression(expressions, expIndex + 1);
      }
    }
    if (expIndex < (expressions.length - 1)) {
      throw new DateTimeParseException(raw, this.pattern, expressions[expIndex]);
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
    if (pam == 1) {
      // 根据上下午 推敲小时
      date.setHours(date.getHours() + 12);
    }
    if (offset !== 0) {
      // 补充时差计算
      const time = date.getTime() - offset * 60000;
      date = new Date(time);
    }
    if (!record.d && record.E) {
      // 在没有日期场景下，根据星期来设置日期
      const week = getNormalDay(date);
      const offset = parseInt(record.E) - week;
      const isStartYear = year == startYear && month == 0;
      const offsetDay = isStartYear ? 7 - week + parseInt(record.E) : offset;
      date = new Date(date.getTime() + offsetDay * 24 * 60 * 60 * 1000);
    }

    if(/Invalid/i.test(date.toString())) {
      throw new InvalidDateTimeFormatException(raw, this.pattern);
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
      const key = alias[match?.[0]] || match?.[0];
      const handler = formatters[key as FormatterTypes];
      return handler ? handler(date, match, this.locale) : match;
    }).replace?.(/'/g, '');
  }
}