
/**
 * Module dependencies.
 */
const http = require('http');
//const cluster = require('cluster');
//const os = require('os');
const config = require('../server/config')[process.env.NODE_ENV || 'development']; //do these next two lines even work? I may need /config/index on this line
const app = require('../server/app')(config);
const db = require('../server/lib/db');

//--------------------------------------------------------------------------------------------------------------------------------------------
const log = config.log();

const port = 3000; //I ADDED THIS WHILE SLOWLY ADDING FUNCTIONALITY. IT WILL BE REMOVED LATER ON

//const numCPUs = os.cpus().length;
// Helper functions

/**
 * Normalize a port into a number, string, or false.
 */
/*
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}
*/

/**
 * Get port from environment and store in Express.
 */
/*
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
*/
/**
 * Create HTTP server and listen on the provided port
 */

const server = http.createServer(app);
const io = require('../server/services/websocket/index')(http); //this must be after the server is instantiated
log.info(io)
/*
if (cluster.isMaster) {
  log.info(`Master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    log.fatal(`Worker ${worker.process.pid} just died`);
    cluster.fork();
  });
} else {*/
  db.connect(config.database.dsn)
    .then(() => {
      log.info('Connected to MongoDB');
      server.listen(port);
    })
    .catch((err) => {
      log.fatal(err);
    });
//}

server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  log.info(`Listening on ${bind}`);
});

// Handle server errors
/*
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      log.fatal(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      log.fatal(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      log.info(error);
    // throw error;
  }
});
*/

//---------------------------------------------------------------------------------------------------------------------------------
/*
server.listen(3000, () => {
    log.info("server listening");
    //console.log(app);
    //console.log(routes);
});
*/