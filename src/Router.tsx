import React from "react";
import { RouterContextValue, RouterContext } from "./RouterContext";
import qs from "qs";

export const useRouter = () => React.useContext(RouterContext);

export const Router = ({ children }: { children: React.ReactNode }) => {
  const [href, setHref] = React.useState(window.location.href);

  const update = React.useCallback(() => setHref(window.location.href), [
    window.location.href
  ]);

  const { pathname } = window.location;

  React.useEffect(() => {
    const onpopstatebefore = window.onpopstate;
    const pushStateBefore = window.history.pushState;

    window.history.pushState = function(
      data: any,
      title: string,
      url?: string
    ) {
      pushStateBefore.call(this, data, title, url);
      update();
    };

    window.onpopstate = function(event) {
      if (onpopstatebefore) onpopstatebefore.call(this, event);
      update();
    };

    return () => {
      window.history.pushState = pushStateBefore;
      window.onpopstate = onpopstatebefore;
    };
  }, []);

  const navigate = React.useCallback((path, query) => {
    const stringifiedQuery = query ? qs.stringify(query) : null;
    const pathWithQuery = stringifiedQuery
      ? [path, stringifiedQuery].join("?")
      : path;
    window.history.pushState({}, "", pathWithQuery);
  }, []);

  const defaultState = useRouter();

  const initialState: RouterContextValue = {
    ...defaultState,
    query: window.location.search
      ? qs.parse(window.location.search.slice(1))
      : {},
    fullPath: pathname,
    update,
    navigate,
    unmatched: pathname
  };

  return (
    <RouterContext.Provider value={initialState}>
      {children}
    </RouterContext.Provider>
  );
};

export default Router;
