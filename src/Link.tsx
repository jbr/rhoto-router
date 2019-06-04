import React from "react";
import { useRouter } from "./Router";

const join = (base: string, part: string) =>
  `${base}/${part.replace(/^\//, "")}`;

const relativeHref = (base: string, relative: string): string => {
  if (relative.startsWith("./")) {
    return join(base, relative.slice(1));
  } else if (relative.startsWith("../")) {
    const stripped = base.replace(/\/[^\/]+$/, "");
    return relativeHref(stripped, relative.slice(1));
  } else return relative;
};

export type ChildrenFunction = (options: any) => JSX.Element;

export interface LinkProps {
  href: string;
  children: JSX.Element | ChildrenFunction;
  currentClassName?: string;
  className?: string;
  exact?: boolean;
  onClick: Function;
  [index: string]: any;
}

export const Link = ({
  href,
  children,
  currentClassName = "active",
  className,
  exact,
  onClick,
  ...props
}: LinkProps) => {
  const { navigate, fullPath } = useRouter();
  const url = relativeHref(fullPath, href);
  const linkClick = React.useCallback(
    evt => {
      if (onClick) onClick(evt);
      evt.preventDefault();
      navigate(url);
    },
    [navigate, onClick]
  );
  const isCurrent = exact ? fullPath === url : fullPath.startsWith(url);

  if (typeof children === "function") {
    return children({ onClick: linkClick, current: isCurrent, url });
  } else {
    return (
      <a
        className={`${isCurrent ? currentClassName : ""} ${className}`}
        href={url}
        onClick={linkClick}
        {...props}
      >
        {children}
      </a>
    );
  }
};
export default Link;
