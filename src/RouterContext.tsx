import { Key } from "path-to-regexp";
import React from "react";

interface Match {
  key: Key;
  match: string;
}

export interface NavigateOptions {
  replace: boolean;
}

export interface RouterContextValue {
  query: { [index: string]: string };
  fullPath: string;
  fullMatchedRoute?: string;
  matches: Match[];
  unmatched: string;
  update(): void;
  navigate(path: string, query?: unknown, options?: NavigateOptions): void;
  navigateParams(newParams: { [index: string]: string }): void;
  routeParams: { [index: string]: string };
  params: { [index: string]: string };
  subroutes: SubrouteData;
  setSubroutes(sd: SubrouteData): void;
  notFound(): void;
}

export interface SubrouteData {
  subroutes: SubrouteData[];
  matched: boolean | null;
  route: string;
  notFound: boolean;
}

export const RouterContext = React.createContext<RouterContextValue>({
  query: {},
  fullPath: window.location.pathname,
  matches: [],
  params: {},
  routeParams: {},
  unmatched: "",
  navigate(url: string) {
    window.location.href = url;
  },
  navigateParams() {},
  update() {},
  subroutes: {
    route: "ROOT",
    subroutes: [],
    matched: null,
    notFound: false
  },
  notFound() {},
  setSubroutes() {}
});

export default RouterContext;
