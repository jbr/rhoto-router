import React from "react";
import {
  RouterContextValue,
  RouterContext,
  SubrouteData,
  NavigateOptions,
} from "./RouterContext";
import { parse, stringify } from "qs-esm";

export function subrouteReducer(
  state: SubrouteData,
  action: SubrouteData,
): SubrouteData {
  let newState: SubrouteData;
  const existing = state.subroutes.find((sr) => sr.route === action.route);
  if (existing) {
    newState = {
      ...state,
      subroutes: state.subroutes.map((sr) =>
        sr.route === action.route ? action : sr,
      ),
    };
  } else {
    newState = { ...state, subroutes: [...state.subroutes, action] };
  }

  newState.matched =
    (newState.subroutes.length === 0 && newState.matched) ||
    !!newState.subroutes.find((sr) => sr.matched);
  return newState;
}

export function useSubrouteReducer(defaultState: SubrouteData) {
  return React.useReducer(subrouteReducer, defaultState);
}

export function useRouter(): RouterContextValue {
  return React.useContext(RouterContext);
}

export interface RouterProps {
  children: React.ReactNode;
  /**
   * Scroll to the top of the page when a `navigate` changes the pathname.
   *
   * Opt-in because the router serves two distinct usages. An app that treats
   * the url as a state store — where `navigateParams` records an interaction
   * that isn't really navigation, so it's reachable by back/forward and by
   * link — wants the viewport left alone. An app doing page-wise navigation
   * wants it to feel like a browser navigation, which starts at the top.
   *
   * Only pathname changes scroll, so the two usages coexist in one app: a
   * query-only `navigateParams` holds position even with this enabled.
   */
  scrollToTop?: boolean;
}

export const Router = ({ children, scrollToTop = false }: RouterProps) => {
  const [, setHref] = React.useState(window.location.href);

  const update = React.useCallback(() => setHref(window.location.href), []);

  const { pathname } = window.location;

  React.useEffect(() => {
    const onpopstatebefore = window.onpopstate;
    const pushStateBefore = window.history.pushState;

    window.history.pushState = function (
      data: any,
      title: string,
      url?: string,
    ) {
      pushStateBefore.call(this, data, title, url);
      update();
    };

    window.onpopstate = function (event: PopStateEvent) {
      if (onpopstatebefore) onpopstatebefore.call(this, event);
      update();
    };

    return () => {
      window.history.pushState = pushStateBefore;
      window.onpopstate = onpopstatebefore;
    };
  }, []);

  const navigate = React.useCallback(
    (path: string, query?: unknown, options?: NavigateOptions) => {
      const stringifiedQuery = query ? stringify(query) : null;
      const pathWithQuery = stringifiedQuery
        ? [path, stringifiedQuery].join("?")
        : path;

      if (options?.replace) {
        window.history.replaceState({}, "", pathWithQuery);
      } else {
        // Read the outgoing pathname before pushState overwrites it. A
        // `replace` is a correction to the current url rather than a move to a
        // new page, so it never scrolls.
        const changedPath =
          new URL(pathWithQuery, window.location.href).pathname !==
          window.location.pathname;

        window.history.pushState({}, "", pathWithQuery);

        if (scrollToTop && changedPath) window.scrollTo(0, 0);
      }
    },
    [scrollToTop],
  );

  const defaultState = useRouter();

  const [subroutes, setSubroutes] = useSubrouteReducer(defaultState.subroutes);

  const initialState: RouterContextValue = {
    ...defaultState,
    query: window.location.search
      ? parse(window.location.search.slice(1))
      : {},
    fullPath: pathname,
    update,
    navigate,
    unmatched: pathname,
    subroutes,
    setSubroutes,
  };

  return (
    <RouterContext.Provider value={initialState}>
      {children}
    </RouterContext.Provider>
  );
};

export default Router;
