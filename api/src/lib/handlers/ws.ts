import { FastifyInstance } from 'fastify';
import fastifyWS from '@fastify/websocket';
import handleAccessToken from './accessToken';


export function registerWS(app: FastifyInstance) {
  app.register(fastifyWS);

  app.addHook('preValidation', async (request, reply) => {
    if(!request.url.startsWith('/ws')) return;
    const res = handleAccessToken(request.headers.authorization);
    if (!res.ok) {
      await reply.code(401).send(res.message);
    }
  });

  app.decorate('hui', {
    hello: 'world',
  })

  app.get('/hui', async (request, reply) => {
    console.log(request);
    return 'hui';
  })
  
  app.register(async function (fastify) {
    fastify.get(
      '/ws',
      { websocket: true },
      (connection /* SocketStream */, req /* FastifyRequest */) => {
        connection.socket.on('message', (message) => {
          // message.toString() === 'hi from client'
          connection.socket.send('hi from server');
        });
      }
    );
  });
}
