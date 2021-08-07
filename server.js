const http = require('http');
const port = process.env.PORT || 3000;
const routing = require('./app/routing')
const server = http.createServer(routing);
server.listen(port);