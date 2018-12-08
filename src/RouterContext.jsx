import React from "react";

export const RouterContext = React.createContext({
  fullPath: window.location.pathname,
  matches: []
});

export default RouterContext;
