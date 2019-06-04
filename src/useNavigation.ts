import pathToRegexp from "path-to-regexp";
import React from "react";
import RouterContext from "./RouterContext";

export const useFancyNavigation = () => {
    const route = React.useContext(RouterContext);
    const { fullMatchedRoute } = route;
    const reverse = pathToRegexp.compile(fullMatchedRoute);
    return (newParams: { [index: string]: string }): void => {
        const query = Object.keys(newParams).reduce(
            (queries, key) =>
                route.routeParams.hasOwnProperty(key)
                    ? queries
                    : { ...queries, [key]: newParams[key] },
            route.query
        );

        route.navigate(reverse({ ...route.params, ...newParams }), query);
    };
};
