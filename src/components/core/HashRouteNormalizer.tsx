import { useEffect } from "react";
import { useLocation } from "wouter";

const getBasePath = (): string => {
  const baseUrl = import.meta.env.BASE_URL;
  if (baseUrl === "/") return "/";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

export const HashRouteNormalizer = () => {
  const [location] = useLocation();

  useEffect(() => {
    const basePath = getBasePath();
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    const expectedPathname = basePath;
    const isAtBasePath =
      pathname === expectedPathname || pathname === `${expectedPathname}/`;

    if (isAtBasePath) {
      const expectedHash = location === "/" ? "" : `#${location}`;
      const needsUpdate =
        pathname !== expectedPathname || hash !== expectedHash;

      if (needsUpdate) {
        const newUrl = expectedHash
          ? `${expectedPathname}${expectedHash}`
          : expectedPathname;
        window.history.replaceState(null, "", newUrl);
      }
    } else {
      const route = pathname.startsWith(basePath)
        ? pathname.slice(basePath.length)
        : pathname.startsWith("/")
        ? pathname
        : `/${pathname}`;

      const newUrl =
        route === "/" || route === ""
          ? expectedPathname
          : `${expectedPathname}#${route}`;

      window.history.replaceState(null, "", newUrl);
    }
  }, [location]);

  return null;
};
