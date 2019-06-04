import React from "react";
import { RouterContextValue, RouterContext } from "./RouterContext";
import qs from "qs";
interface RouterProps {
  children: JSX.Element;
}

export const Router = ({ children }: RouterProps) => {
  const [_href, update] = React.useReducer(
    () => window.location.href,
    window.location.href
  );

  React.useEffect(() => {
    const onpopstatebefore = window.onpopstate;
    window.onpopstate = function(event) {
      if (onpopstatebefore) onpopstatebefore.call(this, event);
      update(window.location.href);
    };
    return () => (window.onpopstate = onpopstatebefore);
  });

  const navigate = React.useCallback(
    (path, query) => {
      const stringifiedQuery = query ? qs.stringify(query) : null;
      const pathWithQuery = stringifiedQuery
        ? [path, stringifiedQuery].join("?")
        : path;
      window.history.pushState({}, "", pathWithQuery);
      update(window.location.href);
    },
    [update]
  );

  const defaultState = React.useContext(RouterContext);

  const initialState: RouterContextValue = {
    ...defaultState,
    query: window.location.search
      ? qs.parse(window.location.search.slice(1))
      : {},
    fullPath: window.location.pathname,
    update,
    navigate,
    unmatched: window.location.pathname
  };

  return (
    <RouterContext.Provider value={initialState}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => React.useContext(RouterContext);

export default Router;
