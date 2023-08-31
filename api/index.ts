import 'dotenv/config';

import Fastify from 'fastify';
import socketioServer from 'fastify-socket.io';
import { registerRoutes } from './routes';

import handleAccessToken from './helpers/handleAccessToken';

const app = Fastify({
  logger: true
});

app.register(socketioServer, {
  allowRequest(req, fn) {
    const res = handleAccessToken(req.headers.authorization);
    fn(res.message, res.ok);
  },
});

async function start() {
  if (!process.env.WS_ACCESS_TOKEN) {
    app.log.error('WS_ACCESS_TOKEN not set in .env');
    return;
  }

  try {
    registerRoutes(app);

    await app.listen({
      port: process.env.PORT ? Number(process.env.PORT) : 3000
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
