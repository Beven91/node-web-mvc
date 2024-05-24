/**
 * @module MultipartMessageConverter
 * @description 一个用于处理http请求格式为multipart/类型内容的处理器
 */
import MediaType from '../MediaType';
import MultipartFile from '../MultipartFile';
import AbstractBodyReader from './AbstractBodyReader';
import type { Multipart } from '../../config/WebAppConfigurerOptions';
import type HttpServletRequest from '../HttpServletRequest';
import NoBoundaryException from '../../../errors/NoBoundaryException';
import MultipartSubpart from './MultipartSubpart';

export default class MultipartBodyReader extends AbstractBodyReader {

  private readonly multipart: Multipart

  constructor(config: Multipart) {
    super(MediaType.MULTIPART_FORM_DATA)
    this.multipart = config;
  }

  readInternal(request: HttpServletRequest, mediaType: MediaType) {
    const nativeRequest = request.nativeRequest;
    const boundary = mediaType.parameters['boundary'];
    if (!boundary) {
      throw new NoBoundaryException();
    }
    const startBoundary = `--${boundary}`;
    const toString = (buffer: Buffer) => buffer.toString(mediaType.charset);
    return new Promise((resolve, reject) => {
      let subpart = new MultipartSubpart(startBoundary, this.multipart, []);
      const formValues = {} as Record<string, any>;
      nativeRequest.on('error', reject);
      nativeRequest.on('data', (chunk: Uint8Array) => {
        try {
          chunk.forEach((code, index) => {
            if (subpart.read(code)) {
              return;
            }
            const buffer = subpart.currentBuffer;
            switch (subpart.status) {
              case 'boundary':
                if (toString(buffer) == startBoundary) {
                  subpart.status = 'header';
                }
                subpart.clearBuffer();
                break;
              case 'header':
                if (!subpart.parseSubpartHeader(toString(buffer))) {
                  subpart.status = 'body';
                  subpart.writter?.on?.('error', reject);
                }
                subpart.clearBuffer();
                break;
              case 'body':
                const v = subpart.finish(mediaType.charset);
                formValues[subpart.name] = v;
                if (v instanceof MultipartFile) {
                  request.servletContext.addReleaseQueue(() => v.destory());
                }
                // 读取结束，开始读取下一个subpart
                subpart = new MultipartSubpart(startBoundary, this.multipart, subpart.tempRaw);
                break;
            }
          })
        } catch (ex) {
          reject(ex);
        }
      });
      nativeRequest.on('end', () => {
        resolve(formValues)
      });
    })
  }
}