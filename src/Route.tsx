import pathToRegexp from "path-to-regexp";
import React from "react";
import RouterContext, { RouterContextValue } from "./RouterContext";
import { useRouter } from "./Router";

interface UseRouteOptions {
  path: string;
  exact?: boolean;
  notMatching?: boolean;
}

export const useRoute = (
  argument?: string | UseRouteOptions
): RouterContextValue | null => {
  const options: UseRouteOptions =
    typeof argument === "string" ? { path: argument } : argument;
  const { path, exact, notMatching } = options;

  const [keys, regexp] = React.useMemo(() => {
    let keys: pathToRegexp.Key[] = [];
    return [keys, pathToRegexp(path, keys, { end: !!exact })];
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
    {}
  );

  const params = { ...routeParams, ...route.query };

  const navigateParams = React.useCallback(
    (newParams: { [index: string]: string }): void => {
      const reverse = pathToRegexp.compile(fullMatchedRoute);

      const newQuery = Object.keys(newParams).reduce(
        (queries, key) =>
          routeParams.hasOwnProperty(key)
            ? queries
            : { ...queries, [key]: newParams[key] },
        route.query
      );

      route.navigate(reverse({ ...routeParams, ...newParams }), newQuery);
    },
    [fullMatchedRoute, routeParams, route.query, route.navigate]
  );

  if (!matches) {
    return notMatching ? route : null;
  } else if (matches && notMatching) {
    return null;
  } else {
    return {
      ...route,
      matches: allMatches,
      routeParams,
      params,
      fullMatchedRoute,
      navigateParams,
      unmatched: route.unmatched.slice(matches[0].length) || "/"
    };
  }
};

interface RouteOptions {
  path: string;
  exact?: boolean;
  notMatching?: boolean;
  children: (params: object) => JSX.Element | JSX.Element;
}

export const Route = ({ path, exact, notMatching, children }: RouteOptions) => {
  const route = useRoute({ path, exact, notMatching });

  if (route) {
    return (
      <RouterContext.Provider value={route}>
        {typeof children === "function" ? children(route.params) : children}
      </RouterContext.Provider>
    );
  } else return null;
};

export default Route;
