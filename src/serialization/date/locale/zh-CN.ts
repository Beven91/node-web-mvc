import Locale from "../../../locale/Locale";
import DateTimeTextProvider from "../DateTimeTextProvider";

DateTimeTextProvider.register(Locale.SIMPLIFIED_CHINESE, {
  months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthsShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  week: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  weekShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  pam: ['上午', '下午'],
});
