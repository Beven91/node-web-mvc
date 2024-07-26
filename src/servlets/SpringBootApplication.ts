import { HotOptions } from 'nodejs-hmr';
import { ClazzType } from '../interface/declare';
import ElementType from './annotations/annotation/ElementType';
import RuntimeAnnotation from './annotations/annotation/RuntimeAnnotation';
import Target from './annotations/Target';

interface WithMainClass {
  main(): void
}

class SpringBootApplication {
  /**
   * 需要排除的自动配置类
   */
  exclude?: ClazzType[];

  /**
   * 根据名称来设定需要排除的自动配置类
   */
  excludeName?: string[];

  /**
   * 要排除的扫描文件
   */
  excludeScan?: string | string[];

  /**
   * 扫描模块目录， 默认为当前启动目录
   */
  scanBasePackages: string | string[];

  /**
   * 是否关闭默认的启动日志
   */
  launchLogOff?: boolean;

  /**
   * 热更新配置
   * @param meta
   */
  hot?: HotOptions | HotOptions['cwd'];

  constructor(meta: RuntimeAnnotation) {
    const clazz = meta.ctor as any as WithMainClass;
    if (typeof clazz.main === 'function') {
      setTimeout(() => {
        clazz.main();
      }, 10);
    }
  }
}

export default Target([ ElementType.TYPE ])(SpringBootApplication);
