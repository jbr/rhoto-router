import React from "react";
import { useRouter } from "./Router";

interface RedirectProps {
  to: string;
}

export const Redirect = ({ to }: RedirectProps): null => {
  const { navigate } = useRouter();
  React.useEffect(() => {
    navigate(to, undefined, { replace: true });
  }, [navigate, to]);
  return null;
};

export default Redirect;
