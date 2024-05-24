import { MediaType, Registry } from '../src';
import WebAppConfigurer from './WebAppConfigurer';

console.log(new MediaType('multipart/form-data; boundary=----WebKitFormBoundaryLFuqAAPatykTLKer'));

Registry.launch(new WebAppConfigurer());