import { IncomingMessage, ServerResponse } from "http";
import { Server } from "next";
import { ComponentType } from "react";
import { LinkState } from "next/link";
import { SingletonRouter, EventChangeOptions } from "next/router";
import { ParsedUrlQuery } from "querystring";

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

export interface Router extends SingletonRouter {
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

export interface Registry {
  getRequestHandler(app: Server, custom?: HTTPHandler): HTTPHandler;
  add(name: string, pattern?: string, page?: string): this;
  add(pattern: string, page: string): this;
  add(options: { name: string; pattern?: string; page?: string }): this;
  Link: ComponentType<LinkProps>;
  Router: Router;
}

export interface Route {
  match(path: string): any;
  valuesToParams(values: any[]): any;
  getHref(params: RouteParams): string;
  getAs(params: RouteParams): string;
  getUrls(params: RouteParams): { as: string; href: string; };
  page: string;
  name: string;
}

export default class Routes implements Registry {
  getRequestHandler(app: Server, custom?: HTTPHandler): HTTPHandler;
  add(name: string, pattern?: string, page?: string): this;
  add(pattern: string, page: string): this;
  add(options: { name: string; pattern?: string; page?: string }): this;
  findByName(name: string): Route;
  match(url: string): {
    route: Route;
    params: any;
    query: ParsedUrlQuery;
  };
  findAndGetUrls(nameOrUrl: string, params: RouteParams): {
    route: Route;
    urls: { as: string; href: string };
    byName?: boolean;
  };
  Link: ComponentType<LinkProps>;
  Router: Router;
}
