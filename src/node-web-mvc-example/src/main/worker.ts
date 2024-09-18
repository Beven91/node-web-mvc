import { WorkerResourceRunner } from 'node-web-mvc';

console.log('init worker=====>');

new WorkerResourceRunner(
  (request, response, next) => {
    console.log(request.url);
    request.on('data', (d)=> {
      console.log('.........---->', d);
    });
    // request.read();
    response.setHeader('AA', 'aaaa');
    response.writeHead(200, 'OK');
    response.write('Hello World sssi am lost kkkkkkkk ');
    response.end('aaaa');
  },
);
