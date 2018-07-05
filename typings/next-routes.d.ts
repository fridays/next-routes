import { IncomingMessage, ServerResponse } from "http";
import { Server } from "next";
import { ComponentType } from "react";
import { LinkState } from "next/link";
import { SingletonRouter, EventChangeOptions } from "next/router";

type HTTPHandler = (
  request: IncomingMessage,
  response: ServerResponse
) => void;

type RouteParams = {
  [k: string]: string | number;
};

interface LinkProps extends LinkState {
  route: string;
  params?: RouteParams;
}

interface Router extends SingletonRouter {
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

interface Registry {
  getRequestHandler(app: Server, custom?: HTTPHandler): HTTPHandler;
  add(name: string, pattern?: string, page?: string): this;
  add(pattern: string, page: string): this;
  add(options: { name: string; pattern?: string; page?: string }): this;
  Link: ComponentType<LinkProps>;
  Router: Router;
}

interface Opts {
  Link?: ComponentType<LinkProps>;
  Router?: Router;
}

declare class Routes implements Registry {
  getRequestHandler(app: Server, custom?: HTTPHandler): HTTPHandler;
  add(name: string, pattern?: string, page?: string): this;
  add(pattern: string, page: string): this;
  add(options: { name: string; pattern?: string; page?: string }): this;
  Link: ComponentType<LinkProps>;
  Router: Router;
}

declare function routes(opts?: Opts): Routes;
declare namespace routes {}
export = routes;
