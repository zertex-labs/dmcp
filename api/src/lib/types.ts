import {
  FastifyReply,
  FastifyRequest,
  RouteGenericInterface,
  RouteOptions as FastifyRouteOptions
} from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';

import { HTTPMethod } from './constants';

export type RouteOptions = FastifyRouteOptions<
  Server,
  IncomingMessage,
  ServerResponse,
  RouteGenericInterface,
  unknown
>;

export type ApiRoute = {
  // handler: (req: FastifyRequest, reply: FastifyReply) => void;
  handler: FastifyRouteOptions['handler'];
  additional?: Omit<FastifyRouteOptions, 'handler' | 'method' | 'url'>;
};

export type ApiRoutes = Partial<
  Record<HTTPMethod, Omit<RouteOptions, 'method' | 'url'>>
>;
