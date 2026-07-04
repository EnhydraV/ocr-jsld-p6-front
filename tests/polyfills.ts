import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'stream/web';

Object.assign(global, {
  TextEncoder,
  TextDecoder,
  ReadableStream,
  Request: global.Request ?? class Request {},
  Response: global.Response ?? class Response {},
  Headers: global.Headers ?? class Headers {},
});
