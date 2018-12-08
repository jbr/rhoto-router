import React from "react";
import { useRouter } from "./Router";

export const Redirect = ({ to }) => {
  const { navigate } = useRouter();
  React.useEffect(() => {
    navigate(to);
  });
  return null;
};

export default Redirect;
