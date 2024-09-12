import { WorkerResourceRunner } from 'node-web-mvc';

console.log('init worker=====>');

new WorkerResourceRunner(
  (request, response, next) => {
    response.setHeader('AA', 'aaaa');
    response.writeHead(200, 'OK');
    response.write('Hello World i am lost ');
    response.end('aaaa');
  },
);
