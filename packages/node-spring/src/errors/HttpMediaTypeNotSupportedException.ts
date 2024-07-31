import MediaType from '../servlets/http/MediaType';
import Exception from './Exception';

export default class HttpMediaTypeNotSupportedException extends Exception {
  constructor(mediaType:MediaType) {
    super(`Content-Type '${mediaType.toString()}' is not supported`);
  }
}
