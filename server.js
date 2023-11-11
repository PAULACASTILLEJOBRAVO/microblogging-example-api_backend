const app = require('./app');
const server = require('http').Server(app);
const debug = require('debug')('microblogging-example-api:server');
require('dotenv').config();
const port = process.env.PORT || 3000;

server.listen(port, () => {
    debug(`Servidor corriendo en el puerto: ${server.address().port}`);
});