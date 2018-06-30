import { IncomingMessage, ServerResponse } from "http";
import { Server } from "next";
import { ComponentType } from "react";
import { LinkState } from "next/link";
import { SingletonRouter, EventChangeOptions } from "next/router";
import { RegExpOptions, ParseOptions } from 'path-to-regexp'

export type HTTPHandler = (
  request: IncomingMessage,
  response: ServerResponse
) => void;

export type PathToRegexpOptions = ParseOptions & RegExpOptions

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

export default class Routes implements Registry {
  getRequestHandler(app: Server, custom?: HTTPHandler): HTTPHandler;
  add(name: string, pattern?: string, page?: string, opts?: { pathToRegexp?: PathToRegexpOptions}): this;
  add(pattern: string, page: string, opts?: { pathToRegexp?: PathToRegexpOptions}): this;
  add(options: { name: string; pattern?: string; page?: string, opts?: { pathToRegexp?: PathToRegexpOptions}}): this;
  Link: ComponentType<LinkProps>;
  Router: Router;
  pathToRegexpOpts: PathToRegexpOptions
}
