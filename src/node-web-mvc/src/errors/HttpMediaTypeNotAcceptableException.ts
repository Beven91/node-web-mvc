import MediaType from '../servlets/http/MediaType';
import Exception from './Exception';

export default class HttpMediaTypeNotAcceptableException extends Exception {
  producibleTypes: MediaType[];

  constructor(producibleTypes: MediaType[]) {
    super('Could not find acceptable representation: ' + JSON.stringify(producibleTypes) );
    this.producibleTypes = producibleTypes;
  }
}
