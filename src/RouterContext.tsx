import { Key } from "path-to-regexp";
import React from "react";

interface Match {
  key: Key;
  match: string;
}

export interface RouterContextValue {
  query: { [index: string]: string };
  fullPath: string;
  fullMatchedRoute?: string;
  matches: Match[];
  unmatched: string;
  update(): void;
  navigate(path: string, query?: unknown): void;
  navigateParams(newParams: { [index: string]: string }): void;
  routeParams: { [index: string]: string };
  params: { [index: string]: string };
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
  navigateParams() { },
  update() { }
});

export default RouterContext;
