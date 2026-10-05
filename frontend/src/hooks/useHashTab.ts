"use client";

import { useCallback, useEffect, useState } from "react";

// Keeps a dashboard tab in the URL hash (e.g. /dashboard/seller#products) so tabs are linkable
export function useHashTab<T extends string>(tabs: readonly T[], fallback: T) {
  const [tab, setTabState] = useState<T>(fallback);

  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.replace("#", "") as T;
      setTabState(tabs.includes(hash) ? hash : fallback);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
    // tabs is a static list per page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback]);

  const setTab = useCallback(
    (next: T) => {
      setTabState(next);
      const url = next === fallback ? window.location.pathname : `${window.location.pathname}#${next}`;
      window.history.replaceState(null, "", url);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [fallback],
  );

  return [tab, setTab] as const;
}
