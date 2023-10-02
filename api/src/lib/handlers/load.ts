import { FastifyInstance } from 'fastify';

import { HTTPMethods, HTTPMethod } from '../constants';
import { ApiRoute, ApiRoutes, RouteOptions } from '../types';
import { HttpClient } from '@upstash/redis/types/pkg/http';

export type LoadRouteOptions = {
  app: FastifyInstance;
  fullPath: string;
  url: string;
  debug?: boolean;
};

export type ConstructRouteOptionsOptions = {
  path: string;
  url: string;
};

export const constructRouteOptions = async ({
  path,
  url
}: ConstructRouteOptionsOptions): Promise<RouteOptions[]> => {
  const module = await import(`file:${path}`); // TODO linux?
  let routes: RouteOptions[] = [];
  if (module.routes as ApiRoutes) {
    for (const [method, rest] of Object.entries(module.routes as ApiRoutes)) {
      routes.push({
        method: method as HTTPMethod,
        url,
        ...rest
      });
    }
    return routes;
  }

  for (const method of HTTPMethods) {
    const route = module?.[method];
    if (route) {
      routes.push({
        handler: typeof route == 'function' ? route : route.handler,
        method,
        url,
        ...(route?.additional ?? {})
      });
    }
  }

  return routes;
};

export const loadRoute = async ({
  app,
  fullPath,
  url,
  debug = true
}: LoadRouteOptions) => {
  const routeOptions = await constructRouteOptions({
    path: fullPath,
    url
  });

  try {
    routeOptions.forEach((route) => app.route(route));
  } catch (e) {
    debug && console.log(e);
    app.log.error(`Error loading route: ${fullPath}`);
  }
};
