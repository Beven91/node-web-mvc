import MediaType from "../servlets/http/MediaType";


export default class HttpMediaTypeNotAcceptableException extends Error {

  producibleTypes: MediaType[]

  constructor(producibleTypes: MediaType[]) {
    super('Could not find acceptable representation: ' + JSON.stringify(producibleTypes) );
    this.producibleTypes = producibleTypes;
  }
}