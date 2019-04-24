import { IncomingMessage, ServerResponse } from 'http';
import { Server } from 'next';
import { ComponentType } from 'react';
import { LinkState } from 'next/link';
import { SingletonRouter, EventChangeOptions, DefaultQuery } from 'next/router';

export type HTTPHandler = (
  request: IncomingMessage,
  response: ServerResponse
) => void;

export type RouteParams = {
  [k: string]: string | number;
};

export interface LinkProps extends LinkState {
  route: string;
  params?: RouteParams;
}

export interface Router<Q = DefaultQuery> extends SingletonRouter<Q> {
  pushRoute(
    route: string,
    params?: RouteParams,
    options?: EventChangeOptions
  ): Promise<boolean>;
  replaceRoute(
    route: string,
    params?: RouteParams,
    options?: EventChangeOptions
  ): Promise<boolean>;
  prefetchRoute(
    route: string,
    params?: RouteParams
  ): Promise<React.ComponentType<any>>;
}

export interface Registry<Q = DefaultQuery> {
  getRequestHandler(app: Server, custom?: HTTPHandler): HTTPHandler;
  add(name: string, pattern?: string, page?: string): this;
  add(pattern: string, page: string): this;
  add(options: { name: string; pattern?: string; page?: string }): this;
  Link: ComponentType<LinkProps>;
  Router: Router<Q>;
}

export default class Routes<Q = DefaultQuery> implements Registry<Q> {
  getRequestHandler(app: Server, custom?: HTTPHandler): HTTPHandler;
  add(name: string, pattern?: string, page?: string): this;
  add(pattern: string, page: string): this;
  add(options: { name: string; pattern?: string; page?: string }): this;
  Link: ComponentType<LinkProps>;
  Router: Router<Q>;
}
