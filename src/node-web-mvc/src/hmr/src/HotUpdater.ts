export declare class HotOptions {
  /**
   * 热更新监听目录
   */
  cwd: string | Array<string>;
  /**
   * 热更新执行频率，单位：毫秒
   */
  reloadTimeout?: number;
  /**
   * 排除目录或者文件
   */
  exclude?: RegExp;
}

export default class HotUpdater {
  private closeHandler: () => void;

  options: HotOptions;

  dirs: string[];

  close() {
    this.closeHandler?.();
  }

  constructor(options: HotOptions, dirs: string[], onRelease: () => void) {
    this.closeHandler = onRelease;
  }
}
