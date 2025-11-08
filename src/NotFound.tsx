import React from "react";
import { useRouter } from "./Router";
import { SubrouteData } from "./RouterContext";

function anyNotFound(state: SubrouteData): boolean {
  return state.notFound || !!state.subroutes.find((sr) => anyNotFound(sr));
}

export function NotFound({ children }: { children: React.ReactNode }) {
  const { subroutes } = useRouter();
  if (anyNotFound(subroutes) || subroutes.matched === false) {
    return <>{children}</>;
  } else return null;
}
