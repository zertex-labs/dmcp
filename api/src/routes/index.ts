import { FastifyInstance } from 'fastify';

export function registerRoutes(app: FastifyInstance) {
  app.ready((err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }

    app.io.on('connection', (socket) => {});
  });
}
