import 'module-alias/register';
import 'dotenv/config';

import Fastify from 'fastify';
import socketioServer from 'fastify-socket.io';

import { registerRoutes, handleAccessToken } from './lib/helpers/index';

const REQUIRED_ENV_VARS = [
  'WS_ACCESS_TOKEN',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'NEON_DATABASE_URL'
] as const;

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty' // pretty print logs in DEV
    }
  }
});

app.register(socketioServer, {
  allowRequest(req, fn) {
    const res = handleAccessToken(req.headers.authorization);
    fn(res.message, res.ok);
  }
});

async function start() {
  const missingEnvVars = REQUIRED_ENV_VARS.filter(
    (envVar) => !process.env[envVar]
  );
  if (missingEnvVars.length) {
    app.log.error(
      `Missing environment variables: ${missingEnvVars.join(', ')}`
    );
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

