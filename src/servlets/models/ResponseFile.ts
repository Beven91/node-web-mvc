/**
 * @module ResponseFile
 * @description 返回文件
 */
import fs from 'fs';
import path from 'path';
import HttpStatus from '../http/HttpStatus';
import MediaType from '../http/MediaType';
import ResponseEntity from './ResponseEntity';

export default class ResponseFile extends ResponseEntity<fs.ReadStream> {

  private readonly file: string

  constructor(file: string, attachment?: boolean) {
    super(HttpStatus.OK)
    file = path.isAbsolute(file) ? file : path.resolve(file);
    this.file = file;
    if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) {
      this.responseStatus = HttpStatus.NOT_FOUND;
    } else {
      this.data = fs.createReadStream(file);
      this.contentType(new MediaType('application/octet-stream'));
    }
    if (attachment) {
      this.header("Content-Disposition", "attachment;filename=" + encodeURI(path.basename(this.file)));
    }
  }
}