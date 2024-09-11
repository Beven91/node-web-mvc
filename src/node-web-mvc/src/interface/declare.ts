import { IncomingMessage, ServerResponse } from 'http';
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http2';

declare type MiddlewareNext = (reason?: any) => void;

export type ClazzType = {
  new(...args:any[]): any
};

export type JsDataType = Function | (abstract new (...args: any[]) => any);

export declare type Middleware = (request: IncomingMessage, response: ServerResponse, ex: MiddlewareNext) => void;

export type HttpHeaderValue = number | string | ReadonlyArray<string>;

export type ResponseHeaders = OutgoingHttpHeaders;

export type RequestHeaders = IncomingHttpHeaders;
