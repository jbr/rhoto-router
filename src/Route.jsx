import pathToRegexp from "path-to-regexp";
import React from "react";
import RouterContext from "./RouterContext";
import { useRouter } from "./Router";
export const useRoute = argument => {
  const { path, exact, notMatching } =
    typeof argument === "string" ? { path: argument } : argument;

  const [keys, regexp] = React.useMemo(
    () => {
      let keys = [];
      return [keys, pathToRegexp(path, keys, { end: !!exact })];
    },
    [path, exact]
  );

  const route = useRouter();
  const { unmatched } = route;

  const matches = regexp.exec(unmatched);

  if (!matches) {
    return notMatching ? route : null;
  } else if (matches && notMatching) {
    return null;
  }

  const namedMatches = matches
    .slice(1)
    .map((m, i) => ({ key: keys[i], match: m }));

  const allMatches = [...route.matches, ...namedMatches];
  const params = allMatches.reduce(
    (o, { key, match }) => (key && key.name ? { ...o, [key.name]: match } : o),
    {}
  );

  const contextValue = {
    ...route,
    matches: allMatches,
    params,
    unmatched: unmatched.slice(matches[0].length) || "/"
  };

  return contextValue;
};

export const Route = ({ path, exact, notMatching, children }) => {
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
