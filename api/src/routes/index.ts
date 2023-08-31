
import { FastifyInstance } from 'fastify';

import { tables, db } from '../lib/drizzle';

export function registerRoutes(app: FastifyInstance) {
  app.ready((err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }

    app.io.on('connection', (socket) => {});
  });

  app.post('/test', (req, reply) => {
    return db.insert(tables.test).values(Array(5).fill({}))
  });
}
