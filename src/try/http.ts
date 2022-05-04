import { createServer, IncomingMessage, ServerResponse } from 'http';
 
const port = 5000;
 
const server = createServer((request: IncomingMessage, response: ServerResponse) => {

  response.on('error', (err) => {
    console.error(err);
  });
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello world!');
});
 
server.listen(port);
console.log('server is running on http://localhost:5000');