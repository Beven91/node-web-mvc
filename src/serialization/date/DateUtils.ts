

const patternRegexp = /(y+|M+|d+|h+|H+|m+|s+|S+|E+|q|a|Z)/g;

const padZero = (num: number, count: number) => {
  let v = num.toString();
  for (let i = 0, k = count - v.length; i < k; i++) {
    v = '0' + v;
  }
  return v;
}

const checkLimit = (exp: string, max: number) => {
  if (exp.length > max) {
    throw new Error(`Too many pattern letters: ${exp[0]}`);
  }
}

// 最小单位格式化器
const formats = {
  // 年
  'y': (date: Date, exp: string) => {
    const year = date.getFullYear();
    return exp == 'yy' ? year.toString().slice(-2) : padZero(year, exp.length);
  },
  // 月 MM:不足两位补0  M:不补0
  'M': (date: Date, exp: string) => {
    checkLimit(exp, 4);
    // TODO MMM MMMM 更多
    return padZero((date.getMonth() + 1), exp.length);
  },
  // 日 dd:不足两位补0  d:不补0
  'd': (date: Date, exp: string) => {
    checkLimit(exp, 2);
    // d dd
    return padZero(date.getDate(), exp.length);
  },
  // 小时(24小时制) HH:不足两位补0   H:不补0
  'H': (date: Date, exp: string) => {
    checkLimit(exp, 2);
    return padZero(date.getHours(), exp.length);
  },
  // 小时(12小时制) hh:不足两位补0   h:不补0
  'h': (date: Date, exp: string) => {
    checkLimit(exp, 2);
    return padZero(date.getHours() % 12 || 12, exp.length);
  },
  // 分钟 mm:不足两位补0   m:不补0
  'm': (date: Date, exp: string) => {
    checkLimit(exp, 2);
    return padZero(date.getMinutes(), exp.length);
  },
  // 秒  ss:不足两位补0   s:不补0
  's': (date: Date, exp: string) => {
    checkLimit(exp, 2);
    return padZero(date.getSeconds(), exp.length);
  },
  // 毫秒 S SS SSS 根据配置返回对应的毫秒位数
  'S': (date: Date, exp: string) => {
    return date.getMilliseconds().toString().slice(0, exp.length)
  },
  // 季度
  'q': (date: Date) => Math.floor((date.getMonth() + 3) / 3).toString(),
  // 星期
  'E': (date: Date, exp: string) => {
    checkLimit(exp, 4);
    return date.getDay().toString()
  },
  // 上午下午
  'a': (date: Date, exp: string) => {
    checkLimit(exp, 5);
    return date.getHours() < 12 ? 'AM' : 'PM';
  },
  // 时区偏移量
  'Z': (date: Date, exp: string) => {
    checkLimit(exp, 5);
    let offsetMinutes = date.getTimezoneOffset();
    let sign = offsetMinutes < 0 ? '+' : '-';
    offsetMinutes = Math.abs(offsetMinutes);
    let hours = Math.floor(offsetMinutes / 60);
    let minutes = offsetMinutes % 60;
    return `${sign}${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
  },
}

// 最小单位解析器
const parsers = {
  // 年
  'y': (raw: string, exp: string, index: number) => {
    // const year = raw.slice(index, index + exp.length);
    // return exp == 'yy' ? year.toString().slice(-2) : padZero(year, exp.length);
  },
  // 月 MM:不足两位补0  M:不补0
  'M': (raw: string, exp: string, index: number) => {
    checkLimit(exp, 4);
    // TODO MMM MMMM 更多
    return padZero((date.getMonth() + 1), exp.length);
  },
  // 日 dd:不足两位补0  d:不补0
  'd': (raw: string, exp: string, index: number) => {
    checkLimit(exp, 2);
    // d dd
    return padZero(date.getDate(), exp.length);
  },
  // 小时(24小时制) HH:不足两位补0   H:不补0
  'H': (raw: string, exp: string, index: number) => {
    checkLimit(exp, 2);
    return padZero(date.getHours(), exp.length);
  },
  // 小时(12小时制) hh:不足两位补0   h:不补0
  'h': (raw: string, exp: string, index: number) => {
    checkLimit(exp, 2);
    return padZero(date.getHours() % 12 || 12, exp.length);
  },
  // 分钟 mm:不足两位补0   m:不补0
  'm': (raw: string, exp: string, index: number) => {
    checkLimit(exp, 2);
    return padZero(date.getMinutes(), exp.length);
  },
  // 秒  ss:不足两位补0   s:不补0
  's': (raw: string, exp: string, index: number) => {
    checkLimit(exp, 2);
    return padZero(date.getSeconds(), exp.length);
  },
  // 毫秒 S SS SSS 根据配置返回对应的毫秒位数
  'S': (raw: string, exp: string, index: number) => {
    return date.getMilliseconds().toString().slice(0, exp.length)
  },
  // 季度
  'q': (raw: string) => Math.floor((date.getMonth() + 3) / 3).toString(),
  // 星期
  'E': (raw: string, exp: string, index: number) => {
    checkLimit(exp, 4);
    return date.getDay().toString()
  },
  // 上午下午
  'a': (raw: string, exp: string, index: number) => {
    checkLimit(exp, 5);
    return date.getHours() < 12 ? 'AM' : 'PM';
  },
  // 时区偏移量
  'Z': (raw: string, exp: string, index: number) => {
    checkLimit(exp, 5);
    let offsetMinutes = date.getTimezoneOffset();
    let sign = offsetMinutes < 0 ? '+' : '-';
    offsetMinutes = Math.abs(offsetMinutes);
    let hours = Math.floor(offsetMinutes / 60);
    let minutes = offsetMinutes % 60;
    return `${sign}${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
  },
}

/**
 * 根据指定格式将字符串解析成日期对象
 * @param raw 日期字符串
 * @param pattern 日期格式
 * @returns 
 */
export const parseDate = (raw: string, pattern: string): Date => {
  const record = {} as Record<string, string>
  pattern = pattern.replace("'T'", 'T');
  pattern.replace(patternRegexp, (match: string, name: string, i: number) => {
    const key = match[0];
    const handler = parsers[key];
    if (handler) {
      const splitChar = pattern[i + match.length];
      const endIndex = splitChar ? raw.indexOf(splitChar, i) : raw.length;
      const value = raw.slice(i, endIndex);
      record[key] = value;
    }
    return match;
  })
  console.log(raw,pattern, record)
  return new Date();
};

/**
 * 将日期对象格式化成指定格式的字符串
 * @param date 日期对象
 * @param pattern 日期格式
 * @returns 
 */
export const formatDate = (date: Date, pattern: string): string => {
  return pattern.replace("'T'", 'T').replace(patternRegexp, (match) => {
    const handler = formats[match[0]];
    return handler ? handler(date, match) : match;
  })
};

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
  "MM/dd/yyyy HH:mm Z"
]

const exp = [
  "2024-07-05",
  "05/07/2024",
  "07/05/2024",
  "16:57:59",
  "04:57 PM",
  "2024-07-05 16:57:59",
  "2024-07-05T16:57:59",
  "2024-07-05T16:57:59.767+0800",
  "5, 0707 5, 2024",
  "07/05/2024 16:57 +0800"
]

const date = new Date();

formatDate(date, examples[0]);

// examples.forEach((m, i) => {
//   console.log(m, ':', formatDate(date, m));
// })

examples.forEach((example,i)=>{
  parseDate(exp[i],example)
})