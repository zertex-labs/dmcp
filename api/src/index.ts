import 'dotenv/config';
import 'module-alias/register';

import fs from 'fs';
import Fastify from 'fastify';

import { registerRoutes } from './lib/helpers/index';
import { registerWS } from './lib/helpers/ws';

const app = Fastify({
  logger: {
    transport: { target: 'pino-pretty' }
  }
});

async function start() {
  const requiredEnvVars = JSON.parse(
    fs.readFileSync('./env.json', 'utf8')
  ) as string[];

  app.log.info(`Required environment variables: ${requiredEnvVars.join(', ')}`);

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length) {
    app.log.error(
      `Missing environment variables: ${missingEnvVars.join(', ')}`
    );
    return;
  }

  app.log.info('All environment variables are present.');

  try {
    registerWS(app);
    registerRoutes(app);

    app.listen(
      {
        port: process.env.PORT ? Number(process.env.PORT) : 3000
      },
      (err) => {
        if (err) {
          app.log.error(err);
          process.exit(1);
        }
      }
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
