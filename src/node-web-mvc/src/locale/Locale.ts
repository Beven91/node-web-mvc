
export default class Locale {
  public readonly language: string;

  public readonly country: string;

  public readonly variant: string;

  constructor(language: string, country: string, variant: string) {
    this.language = language;
    this.country = country;
    this.variant = this.variant;
  }

  /** Useful constant for language.
   */
  public static ENGLISH = new Locale('en', '', '');

  /** Useful constant for language.
  */
  public static FRENCH = new Locale('fr', 'FR', '');

  /** Useful constant for language.
  */
  public static GERMAN = new Locale('de', '', '');

  /** Useful constant for language.
  */
  public static ITALIAN = new Locale('it', '', '');

  /** Useful constant for language.
  */
  public static JAPANESE = new Locale('ja', '', '');

  /** Useful constant for language.
  */
  public static KOREAN = new Locale('ko', '', '');

  /** Useful constant for language.
  */
  public static CHINESE = new Locale('zh', '', '');

  /** Useful constant for country.
  */
  public static CANADA = new Locale('en', 'CA', '');

  /** Useful constant for country.
  */
  public static CANADA_FRENCH = new Locale('fr', 'CA', '');

  /** Useful constant for country.

  /** Useful constant for language.
  */
  public static SIMPLIFIED_CHINESE = new Locale('zh', 'CN', '');

  /** Useful constant for language.
  */
  public static TRADITIONAL_CHINESE = new Locale('zh', 'TW', '');

  /** Useful constant for country.
  */
  public static FRANCE = new Locale('fr', 'FR', '');

  /** Useful constant for country.
  */
  public static GERMANY = new Locale('de', 'DE', '');

  /** Useful constant for country.
  */
  public static ITALY = new Locale('it', 'IT', '');

  /** Useful constant for country.
  */
  public static JAPAN = new Locale('ja', 'JP', '');

  /** Useful constant for country.
  */
  public static UK = new Locale('en', 'GB', '');

  /** Useful constant for country.
  */
  public static US = new Locale('en', 'US', '');

  toString() {
    return `${this.language}${this.country ? '-' + this.country : ''}`;
  }
}
