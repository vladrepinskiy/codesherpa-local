import { useEffect } from "react";
import { useLocation } from "wouter";

export const HashRouteNormalizer = () => {
  const [location] = useLocation();

  useEffect(() => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    if (pathname !== "/") {
      if (hash) {
        window.history.replaceState(null, "", `/${hash}`);
      } else {
        const route = pathname.startsWith("/") ? pathname : `/${pathname}`;
        window.history.replaceState(null, "", `/#${route}`);
      }
    } else if (location !== "/" && !hash) {
      window.history.replaceState(null, "", `/#${location}`);
    }
  }, [location]);

  return null;
};
