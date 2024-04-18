/**
 * @module ModuleLoader
 * @description 模块装载工具
 */
import fs from 'fs';
import path from 'path';
import hot from 'nodejs-hmr';

export default class ModuleLoader {

  /**
   * 装载指定目录下对应模块
   * @param dir 目录
   * @param cache 缓存清单，如果文件已经加载过，则跳过加载，
   * 这里主要用解决windows下目录大小写导致同个模块存在两份。
   */
  constructor(dir, cache) {
    this.load(dir, cache || {});
  }

  /**
   * 判断当前模块是否可加载
   * @param id 
   */
  private loadable(id) {
    const ext = path.extname(id);
    return (ext === '.js' || ext === '.ts');
  }

  /**
   * 加载指定目录下模块
   * @param dir 待加载目录
   * @param cache 缓存配置
   */
  private load(dir, cache) {
    const children = fs.readdirSync(dir);
    children.forEach((name) => {
      const id = path.join(dir, name);
      if (fs.lstatSync(id).isDirectory()) {
        // 装载子目录
        return this.load(id, cache);
      } else if (this.loadable(id) && !cache[id.toLowerCase()]) {
        // 装载
        require(id);
      }
    });
  }
}

hot.create(module).accept(() => {

})