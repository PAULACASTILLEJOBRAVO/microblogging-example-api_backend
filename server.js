const app = require('./app');
const server = require('http').Server(app);
const debug = require('debug')('app:server');
const port = process.env.NODE_PORT || 3003;

server.listen(port, () => {
    debug(`Servidor corriendo en el puerto: ${server.address().port}`);
});