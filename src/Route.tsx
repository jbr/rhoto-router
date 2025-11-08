import { pathToRegexp, compile, Key } from "path-to-regexp";
import React from "react";
import RouterContext, { RouterContextValue } from "./RouterContext";
import { useRouter, useSubrouteReducer } from "./Router";
import { JSXChildren, JSXChildrenFunction } from "./types";

interface UseRouteOptions {
  path: string;
  exact?: boolean;
}

export const useRoute = (
  argument?: string | UseRouteOptions,
): RouterContextValue | null => {
  const options: UseRouteOptions =
    typeof argument === "string" ? { path: argument } : argument;
  const { path, exact } = options;

  const [keys, regexp] = React.useMemo(() => {
    const { regexp, keys } = pathToRegexp(path, { end: !!exact });
    return [keys, regexp];
  }, [path, exact]);

  const route = useRouter();
  const matches = regexp.exec(route.unmatched);

  const namedMatches = matches
    ? matches.slice(1).map((m, i) => ({ key: keys[i], match: m }))
    : [];

  const fullMatchedRoute = [route.fullMatchedRoute, path].join("");

  const allMatches = [...route.matches, ...namedMatches];

  const routeParams = allMatches.reduce(
    (o, { key, match }) => (key && key.name ? { ...o, [key.name]: match } : o),
    {},
  );

  const params = { ...routeParams, ...route.query };

  const navigateParams = React.useCallback(
    (newParams: { [index: string]: string }): void => {
      const reverse = compile(fullMatchedRoute);

      const newQuery = Object.keys(newParams).reduce(
        (queries, key) =>
          routeParams.hasOwnProperty(key)
            ? queries
            : { ...queries, [key]: newParams[key] },
        route.query,
      );

      route.navigate(reverse({ ...routeParams, ...newParams }), newQuery);
    },
    [fullMatchedRoute, routeParams, route.query, route.navigate],
  );

  const [notFound, setNotFound] = React.useState<boolean>(false);

  const [subroutes, setSubroutes] = useSubrouteReducer({
    route: path,
    subroutes: [],
    matched: !!matches,
    notFound: false,
  });

  React.useEffect(() => {
    route.setSubroutes({ ...subroutes, notFound });
  }, [path, subroutes, notFound, route.setSubroutes]);

  if (route.subroutes.matched !== false && matches) {
    return {
      ...route,
      notFound() {
        setNotFound(true);
      },
      subroutes,
      setSubroutes,
      matches: allMatches,
      routeParams,
      params,
      fullMatchedRoute,
      navigateParams,
      unmatched: route.unmatched.slice(matches[0].length) || "/",
    };
  } else {
    return null;
  }
};

interface RouteOptions {
  path: string;
  exact?: boolean;
  notMatching?: boolean;
  children: JSXChildren | JSXChildrenFunction;
}

export const Route = ({ path, exact, children }: RouteOptions) => {
  const route = useRoute({ path, exact });

  if (route) {
    return (
      <RouterContext.Provider value={route}>
        {typeof children === "function" ? children(route.params) : children}
      </RouterContext.Provider>
    );
  } else return null;
};

export default Route;
