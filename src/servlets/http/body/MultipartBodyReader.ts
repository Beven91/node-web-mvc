/**
 * @module MultipartMessageConverter
 * @description 一个用于处理http请求格式为multipart/类型内容的处理器
 */
import path from 'path';
import fs from 'fs';
import MediaType from '../MediaType';
import MultipartFile from '../MultipartFile';
import EntityTooLargeError from '../../../errors/EntityTooLargeError';
import AbstractBodyReader from './AbstractBodyReader';
import type { Multipart } from '../../config/WebAppConfigurerOptions';
import type HttpServletRequest from '../HttpServletRequest';
import NoBoundaryException from '../../../errors/NoBoundaryException';
import { randomUUID } from 'crypto';

type ReadStatus = 'boundary' | 'header' | 'body' | 'after-boundary'

interface MultipartSubpart {
  headers: {
    [x: string]: string
  }
  name: string
  mediaType: MediaType
  filename: string
  isFile: boolean
  size: number
  previousCode: number
  needTryBoundary: boolean
  tempRaw: number[]
  tempFile: string
  startBoundary: string
  endBoundary: string
  writter?: fs.WriteStream
}

export default class MultipartBodyReader extends AbstractBodyReader {

  private readonly multipart: Multipart

  private readonly tempRoot: string

  private readonly maxFileSize: number

  constructor(config: Multipart) {
    super(MediaType.MULTIPART_FORM_DATA)
    this.multipart = config;
    this.tempRoot = path.join(config.mediaRoot, 'tmp-files');
    this.maxFileSize = Number(config.maxFileSize);
    MultipartFile.ensureDirSync(this.tempRoot);
  }

  private parseContentDisposition(content: string) {
    const segments = content.split(';');
    const info = {} as { filename: string, name: string };
    segments.forEach((segment) => {
      const [k, v] = segment.trim().split('=');
      info[k] = v ? v.slice(1, v.length - 1) : '';
    });
    return info;
  }

  private createSubpart(startBoundary: string, endBoundary: string, code?: number): MultipartSubpart {
    return {
      headers: {},
      isFile: false,
      size: 0,
      name: '',
      tempRaw: [],
      mediaType: null,
      filename: '',
      tempFile: '',
      previousCode: code,
      needTryBoundary: false,
      startBoundary,
      endBoundary
    }
  }

  private readSubpartHeader(content: string, subpart: MultipartSubpart) {
    if (!content && subpart.isFile) {
      subpart.tempFile = path.join(this.tempRoot, randomUUID());
      subpart.writter = fs.createWriteStream(subpart.tempFile);
      return false;
    } else if (!content) {
      return false;
    }
    const [keyName, value] = content.split(':');
    const key = keyName.trim();
    switch (key.toLowerCase()) {
      case 'content-disposition':
        {
          const s = this.parseContentDisposition(value || '');
          subpart.name = s.name;
          subpart.isFile = 'filename' in s;
          subpart.filename = s.filename;
          subpart[key] = value;
        }
        break;
      case 'content-type':
        subpart.mediaType = new MediaType(value?.trim?.());
        subpart[key] = value;
        break;
      default:
        subpart[key] = value;
    }
    return true;
  }

  private createSubpartFile(subpart: MultipartSubpart) {
    const { filename, tempFile, size } = subpart;
    return new MultipartFile(filename, tempFile, subpart.mediaType, size, this.multipart.mediaRoot);
  }

  private readChunk(code: number, raw: number[], subpart: MultipartSubpart) {
    const isCRLF = code == 10 && subpart.previousCode == 13;
    subpart.previousCode = code;
    if (isCRLF) {
      if (raw[raw.length - 1] === 13) {
        raw.pop();
      }
      // 如果是换行
      return false;
    }
    raw.push(code);
    return true;
  }

  private tryWrite(raw: any[], subpart: MultipartSubpart) {
    const tempRaw = subpart.tempRaw;
    if (subpart.writter) {
      subpart.writter.write(Buffer.from(tempRaw));
    } else {
      raw.push(...tempRaw);
    }
    subpart.tempRaw.length = 0;
  }

  private readBodyChunk(code: number, raw: number[], subpart: MultipartSubpart) {
    const isCRLF = code == 10 && subpart.previousCode == 13;
    subpart.previousCode = code;
    if (isCRLF && !subpart.needTryBoundary) {
      subpart.needTryBoundary = true;
      // 如果碰到 "-" 字符,则先把前面写出
      this.tryWrite(raw, subpart);
      return true;
    }
    if (subpart.tempRaw.length > 4096) {
      // 大于分块则写出
      this.tryWrite(raw, subpart);
    }
    subpart.size++;
    subpart.tempRaw.push(code);
    if (subpart.size > this.maxFileSize) {
      throw new EntityTooLargeError(subpart.filename, subpart.size, this.maxFileSize);
    }
    return !this.isBoundary(subpart);
  }

  private isBoundary(subpart: MultipartSubpart) {
    const raw = subpart.tempRaw;
    if (subpart.needTryBoundary && raw.length == subpart.startBoundary.length) {
      subpart.needTryBoundary = false;
      // 检测是否为结束或者开始boundary
      const str = Buffer.from(raw).toString();
      const isEqual = str == subpart.startBoundary;
      if (!isEqual) {
        // 如果不是boundary则需要补充\n
        subpart.tempRaw.push(10);
      }
      return isEqual;
    }
    return false;
  }

  readInternal(request: HttpServletRequest, mediaType: MediaType) {
    const nativeRequest = request.nativeRequest;
    const boundary = mediaType.parameters['boundary'];
    if (!boundary) {
      throw new NoBoundaryException();
    }
    const startBoundary = `--${boundary}`;
    const endBoundary = `--${boundary}--`;
    const toString = (buffer: Buffer) => buffer.toString(mediaType.charset);
    return new Promise((resolve, reject) => {
      let currentSubpart = this.createSubpart(startBoundary, endBoundary);
      let status = 'boundary' as ReadStatus;
      const raw = [];
      const formValues = {} as Record<string, any>;
      const runtime = {
        count: 0,
        index: 0
      }
      nativeRequest.on('error', reject);
      nativeRequest.on('data', (chunk: Uint8Array) => {
        try {
          chunk.forEach((code, index) => {
            if (index == 28742 && status == 'body') {
              const a = 10;
            }
            const isKeeping = status == 'body' ? this.readBodyChunk(code, raw, currentSubpart) : this.readChunk(code, raw, currentSubpart);
            if (isKeeping) {
              return;
            }
            runtime.count++;
            const buffer = Buffer.from(raw);
            switch (status) {
              case 'boundary':
                status = toString(buffer) == startBoundary ? 'header' : 'boundary';
                raw.length = 0;
                break;
              case 'header':
                if (!this.readSubpartHeader(toString(buffer), currentSubpart)) {
                  // 如果是\r\n内容，则准备开始读取body
                  status = 'body';
                  currentSubpart.size = 0;
                  currentSubpart.writter?.on?.('error', reject);
                }
                raw.length = 0;
                break;
              case 'body':
                if (currentSubpart.writter) {
                  currentSubpart.writter.end();
                  currentSubpart.writter = null;
                  const file = this.createSubpartFile(currentSubpart);
                  request.servletContext.addReleaseQueue(() => file.destory());
                  formValues[currentSubpart.name] = file;
                } else {
                  formValues[currentSubpart.name] = toString(buffer);
                }
                raw.push(...currentSubpart.tempRaw);
                currentSubpart.tempRaw.length = 0;
                currentSubpart = this.createSubpart(startBoundary, endBoundary, currentSubpart.previousCode);
                status = 'boundary';
                break;
            }
          })
        } catch (ex) {
          reject(ex);
        }
      });
      nativeRequest.on('end', () => {
        resolve(formValues)
        console.log('end......', runtime.index, runtime.count);
        console.log(formValues);
      });
    })
  }
}