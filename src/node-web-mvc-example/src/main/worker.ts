import { WorkerResourceRunner } from 'node-web-mvc';

console.log('init worker=====>');

new WorkerResourceRunner(
  (request, response, next) => {
    request.on('data', (d)=> {
      console.log('.........', d);
    });
    response.setHeader('AA', 'aaaa');
    response.writeHead(200, 'OK');
    response.write('Hello World i am lost kkkkkkkk ');
    response.end('aaaa');
  },
);
