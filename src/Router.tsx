import React from "react";
import {
  RouterContextValue,
  RouterContext,
  SubrouteData,
  NavigateOptions
} from "./RouterContext";
import qs from "qs";

export function subrouteReducer(
  state: SubrouteData,
  action: SubrouteData
): SubrouteData {
  let newState: SubrouteData;
  const existing = state.subroutes.find(sr => sr.route === action.route);
  if (existing) {
    newState = {
      ...state,
      subroutes: state.subroutes.map(sr =>
        sr.route === action.route ? action : sr
      )
    };
  } else {
    newState = { ...state, subroutes: [...state.subroutes, action] };
  }

  newState.matched =
    (newState.subroutes.length === 0 && newState.matched) ||
    !!newState.subroutes.find(sr => sr.matched);
  return newState;
}

export function useSubrouteReducer(defaultState: SubrouteData) {
  return React.useReducer(subrouteReducer, defaultState);
}

export function useRouter(): RouterContextValue {
  return React.useContext(RouterContext);
}

export const Router = ({ children }: { children: React.ReactNode }) => {
  const [, setHref] = React.useState(window.location.href);

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

    window.onpopstate = function(event: PopStateEvent) {
      if (onpopstatebefore) onpopstatebefore.call(this, event);
      update();
    };

    return () => {
      window.history.pushState = pushStateBefore;
      window.onpopstate = onpopstatebefore;
    };
  }, []);

  const navigate = React.useCallback(
    (path, query, options: NavigateOptions) => {
      const stringifiedQuery = query ? qs.stringify(query) : null;
      const pathWithQuery = stringifiedQuery
        ? [path, stringifiedQuery].join("?")
        : path;

      if (options?.replace) {
        window.history.replaceState({}, "", pathWithQuery);
      } else {
        window.history.pushState({}, "", pathWithQuery);
      }
    },
    []
  );

  const defaultState = useRouter();

  const [subroutes, setSubroutes] = useSubrouteReducer(defaultState.subroutes);

  const initialState: RouterContextValue = {
    ...defaultState,
    query: window.location.search
      ? qs.parse(window.location.search.slice(1))
      : {},
    fullPath: pathname,
    update,
    navigate,
    unmatched: pathname,
    subroutes,
    setSubroutes
  };

  return (
    <RouterContext.Provider value={initialState}>
      {children}
    </RouterContext.Provider>
  );
};

export default Router;
