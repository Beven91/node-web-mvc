import Locale from '../../../node-web-mvc/src/locale/Locale';

describe('Locale', () => {
  describe('构造', () => {
    it('language/country/variant 正确设置', () => {
      const locale = new Locale('en', 'US', 'WIN');
      expect(locale.language).toBe('en');
      expect(locale.country).toBe('US');
    });
  });

  describe('toString', () => {
    it('有 country 时输出 language-country', () => {
      const locale = new Locale('zh', 'CN', '');
      expect(locale.toString()).toBe('zh-CN');
    });

    it('无 country 时仅输出 language', () => {
      const locale = new Locale('en', '', '');
      expect(locale.toString()).toBe('en');
    });
  });

  describe('静态常量', () => {
    it('ENGLISH', () => {
      expect(Locale.ENGLISH.language).toBe('en');
      expect(Locale.ENGLISH.country).toBe('');
    });

    it('SIMPLIFIED_CHINESE', () => {
      expect(Locale.SIMPLIFIED_CHINESE.toString()).toBe('zh-CN');
    });

    it('US', () => {
      expect(Locale.US.toString()).toBe('en-US');
    });

    it('UK', () => {
      expect(Locale.UK.toString()).toBe('en-GB');
    });

    it('JAPAN', () => {
      expect(Locale.JAPAN.toString()).toBe('ja-JP');
    });

    it('FRENCH', () => {
      expect(Locale.FRENCH.language).toBe('fr');
    });

    it('GERMAN', () => {
      expect(Locale.GERMAN.language).toBe('de');
    });
  });
});
