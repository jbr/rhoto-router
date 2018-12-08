import React from "react";
import RouterContext from "./RouterContext";
export const Router = ({ children }) => {
  const [fullPath, update] = React.useReducer(
    () => window.location.pathname,
    window.location.pathname
  );

  React.useEffect(() => {
    const onpopstatebefore = window.onpopstate;
    window.onpopstate = event => {
      if (onpopstatebefore) onpopstatebefore(event);
      update();
    };
    return () => (window.onpopstate = onpopstatebefore);
  });

  const navigate = React.useCallback(
    path => {
      window.history.pushState({}, "", path);
      update();
    },
    [update]
  );

  const initialState = {
    fullPath,
    update,
    navigate,
    matches: [],
    unmatched: fullPath
  };

  return (
    <RouterContext.Provider value={initialState}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => React.useContext(RouterContext);

export default Router;
