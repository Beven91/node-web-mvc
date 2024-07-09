import Locale from "../../locale/Locale";

export interface DateTimeLocale {
  // 1到12个月的简写
  monthsShort: string[]
  // 1到12个月的完全名称
  months: string[]
  // 1到7天的简写
  week: string[]
  // 1到7天的完全名称
  weekShort: string[]
  pam: string[]
}

const cache = new Map<string, DateTimeLocale>();

export default class DateTimeTextProvider {

  static register(locale: Locale, info: DateTimeLocale) {
    const key = locale.toString();
    if (!cache.get(key)) {
      cache.set(key, info);
    }
  }

  static getLocaleInfo(locale: Locale) {
    return cache.get(locale.toString());
  }

  static getText(raw: string, type: keyof DateTimeLocale, locale: Locale, full: boolean) {
    const key = locale.toString();
    const dateTimeLocale = cache.get(key);
    if (dateTimeLocale) {
      return dateTimeLocale[type]?.[raw];
    }
    return raw;
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
}