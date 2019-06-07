import { Key } from "path-to-regexp";
import React from "react";

interface Match {
  key: Key;
  match: string;
}

export interface RouterContextValue {
  query: object;
  fullPath: string;
  fullMatchedRoute?: string;
  matches: Match[];
  unmatched: string;
  update?: Function;
  navigate?: Function;
  navigateParams?: Function;
  routeParams: object;
  params: object;
}

export const RouterContext = React.createContext<RouterContextValue>({
  query: {},
  fullPath: window.location.pathname,
  matches: [],
  params: {},
  routeParams: {},
  unmatched: ""
});

export default RouterContext;
