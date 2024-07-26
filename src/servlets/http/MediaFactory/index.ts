/**
 * @module MediaTypeFactory
 * @description 媒体类型工厂
 */
import path from 'path';
import fs from 'fs';
import MediaType from '../MediaType';

const file = path.join(__dirname, '../../../../mime.type');

const runtime = {
  mimeTypes: null,
};

export default class MediaTypeFactory {
  /**
   * 加载所有MIME类型
   */
  static load() {
    const content = fs.readFileSync(file).toString('utf-8');
    const lines = content.split('\n');
    const mediaTypes = {};
    lines.forEach((line) => {
      if (line[0] !== '#') {
        const segments = line.split('\t');
        const mediaType = segments.shift();
        const exts = (segments.find((s) => !!s) || '').split(' ').filter((s) => !!s);
        exts.forEach((ext) => {
          mediaTypes['.' + ext] = new MediaType(mediaType);
        });
      }
    });
    return mediaTypes;
  }

  /**
   * 当前支持的所有MIME类型
   */
  static get mimeTypes() {
    if (!runtime.mimeTypes) {
      runtime.mimeTypes = this.load();
    }
    return runtime.mimeTypes;
  }

  /**
   * 获取指定文件的媒体类型
   * @param filename
   */
  static getMediaType(filename: string): MediaType {
    if (!filename) {
      return null;
    }
    const ext = path.extname(filename).toLowerCase();
    return this.mimeTypes[ext] as MediaType;
  }
}
