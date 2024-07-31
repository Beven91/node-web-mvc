import Locale from '../../locale/Locale';
import path from 'path';
import fs from 'fs';

const dayMillseconds = (24 * 60 * 60 * 1000);

export interface DateTimeLocale {
  // 1到12个月的简写
  monthsShort: string[]
  // 1到12个月的完全名称
  months: string[]
  // 1到7天的简写
  week: string[]
  // 1到7天的完全名称
  weekShort: string[]
  weekdaysMin: string[]
  // 上下午名称
  pam: string[]
  // 周定义
  weekDefine: {
    // 星期开始值 0-6
    firstDayOfWeek: number
    // 当年第一周必须要包含的天数
    dminimalDaysInFirstWeeky: number
  }
}

const cache = new Map<string, DateTimeLocale>();

export default class DateTimeTextProvider {
  static register(locale: string, info: DateTimeLocale) {
    const key = locale.toString();
    if (!cache.get(key)) {
      cache.set(key, info);
    }
  }

  private static getAndRegister(locale: Locale) {
    const key = locale.toString();
    if (!cache.has(key)) {
      const id = path.join(__dirname, 'locale', key + '.json');
      if (fs.existsSync(id)) {
        const content = fs.readFileSync(id).toString('utf-8');
        this.register(key, JSON.parse(content));
      }
    }
    return cache.get(key);
  }

  static getLocaleInfo(locale: Locale) {
    return this.getAndRegister(locale) || this.getAndRegister(Locale.ENGLISH);
  }

  static getMonth(raw: number, locale: Locale, full: boolean) {
    const info = this.getLocaleInfo(locale);
    const data = full ? info.months : info.monthsShort;
    return data[raw];
  }

  static findMonth(raw: string, locale: Locale, full: boolean) {
    const info = this.getLocaleInfo(locale);
    const data = full ? info.months : info.monthsShort;
    const index = data.indexOf(raw);
    return index > -1 ? index + 1 : null;
  }

  static getWeek(raw: number, locale: Locale, full: boolean) {
    const info = this.getLocaleInfo(locale);
    const data = full ? info.week : info.weekShort;
    return data[raw];
  }

  static findWeek(raw: string, locale: Locale, full: boolean) {
    const info = this.getLocaleInfo(locale);
    const data = full ? info.week : info.weekShort;
    const index = data.indexOf(raw);
    return index > -1 ? index : null;
  }

  static getPAM(hour: number, locale: Locale) {
    const index = hour < 12 ? 0 : 1;
    const info = this.getLocaleInfo(locale);
    const data = info.pam;
    return data[index];
  }

  static findPAM(raw: string, locale: Locale) {
    const info = this.getLocaleInfo(locale);
    const data = info.pam;
    const index = data.indexOf(raw);
    return index > -1 ? index : null;
  }

  static startOfWeekOffset(days: number, dow: number, weekDef: DateTimeLocale['weekDefine']) {
    // 累计天数 - 最后一周的多余天数 = 第一周（不满7天的天数)
    const weekStart = this.floorMod(days - dow, 7);
    // 如不满足一周最小天数，则需要将这些天数减除，所以取负数
    let offset = -weekStart;
    if (weekStart + 1 > weekDef.dminimalDaysInFirstWeeky) {
      // 如果第一周不满7天，但是大于一周最小天数，则需要算入当年的一周
      // 也就是返回需要补全的天数
      offset = 7 - weekStart;
    }
    return offset;
  }

  static computeWeek(offset: number, days: number) {
    return Math.floor((7 + offset + days - 1) / 7);
  }

  static dayOffYear(date: Date) {
    const yearStart = new Date(date.getFullYear() - 1, 11, 31);
    return (date.getTime() - yearStart.getTime()) / dayMillseconds;
  }

  static getWeekOfMonth(date: Date, locale: Locale) {
    const week = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const dayOffset = 7 - week;
    const days = date.getDate() - dayOffset;
    const weeks = Math.ceil(days / 7);
    return (weeks + 1).toString();
  }

  static getWeekOfYear(date: Date, locale: Locale) {
    const info = this.getLocaleInfo(locale);
    const weekDef = info.weekDefine;
    // 按照本地语言计算，当前日期是星期几: 当前星期x和开始星期y的绝对差即等于本地星期lx
    const dow = this.floorMod(date.getDay() - weekDef.firstDayOfWeek, 7) + 1;
    // 计算当前日期累计天数
    const doy = this.dayOffYear(date);
    // 计算开始周的差值 (开始日期如果不满足一周最小天数，则值为负数，否则为正数)
    const offset = this.startOfWeekOffset(doy, dow, weekDef);
    // 计算累计周数 (常数 +7 与 -1 保证最后天数满一周)
    let week = this.computeWeek(offset, doy);
    if (week == 0) {
      // 如果值为0，则需要按照上一年最后一周算
      const previous = new Date(date.getTime() - (doy * dayMillseconds));
      return this.getWeekOfYear(previous, locale);
    } else if (week > 50) {
      const yearEnd = new Date(Date.UTC(date.getFullYear(), 11, 31));
      const days = this.dayOffYear(yearEnd);
      // 如果日期接近年底，可能该日期会计入下一年的第一周，所以这里要进行兼容
      const newYearWeek = this.computeWeek(offset, days + weekDef.dminimalDaysInFirstWeeky);
      if (week >= newYearWeek) {
        week = week - newYearWeek + 1;
      }
    }
    return week;
  }

  private static floorMod(x: number, y: number) {
    let mod = x % y;
    if ((mod ^ y) < 0 && mod != 0) {
      mod += y;
    }
    return mod;
  }
}
