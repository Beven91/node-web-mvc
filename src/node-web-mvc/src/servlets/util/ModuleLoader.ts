/**
 * @module ModuleLoader
 * @description 模块装载工具
 */
import fs from 'fs';
import path from 'path';
import hot from '../../hmr/src';

const allowExtensions = {
  '.js': true,
  '.ts': true,
};

export default class ModuleLoader {
  private readonly exclude: string[];
  /**
   * 装载指定目录下对应模块
   * @param dir 目录
   * @param cache 缓存清单，如果文件已经加载过，则跳过加载，
   * 这里主要用解决windows下目录大小写导致同个模块存在两份。
   */
  constructor(dir: string, cache: object, exclude: string[]) {
    this.exclude = exclude || [];
    this.load(dir, cache || {});
  }

  /**
   * 判断当前模块是否可加载
   * @param id
   */
  private loadable(id: string) {
    const ext = path.extname(id);
    return (ext === '.js' || ext === '.ts');
  }

  private isExclude(id: string) {
    const exclude = this.exclude;
    if (exclude?.length < 1) {
      return false;
    }
    return exclude.some((e) => {
      return id.indexOf(e) > -1;
    });
  }

  /**
   * 加载指定目录下模块
   * @param dir 待加载目录
   * @param cache 缓存配置
   */
  private load(dir: string, cache: object) {
    const children = fs.lstatSync(dir).isDirectory() ? fs.readdirSync(dir) : [ dir ];
    children.forEach((name) => {
      const id = path.isAbsolute(name) ? name: path.join(dir, name);
      const ext = path.extname(name);
      if (fs.lstatSync(id).isFile() && !allowExtensions[ext]) {
        return;
      }
      if (this.isExclude(id) || id.indexOf('.d.ts') > 0) {
        console.log('ModuleLoader exclude:', id);
        // 如果需要排除
        return;
      }
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

hot.create(module).accept(() => { });
