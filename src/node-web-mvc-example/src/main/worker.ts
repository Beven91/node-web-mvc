import { WorkerResourceRunner } from 'node-web-mvc';

console.log('init worker=====>');

new WorkerResourceRunner(
  (request, response, next) => {
    response.setHeader('AA', '1234');
    response.writeHead(200, 'OK');
    response.write('Hello World ');
    response.end('aaaa');
  },
);
