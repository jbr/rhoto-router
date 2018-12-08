import React from "react";
import { useRouter } from "./Router";
export const Link = ({ href, children, ...props }) => {
  const { navigate } = useRouter();

  const linkClick = React.useCallback(
    evt => {
      evt.preventDefault();
      navigate(evt.target.href);
    },
    [navigate]
  );

  return (
    <a href={href} onClick={linkClick} {...props}>
      {children}
    </a>
  );
};
export default Link;
