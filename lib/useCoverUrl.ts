"use client";

import { useState, useEffect } from "react";

type CoverStatus = "loading" | "ready" | "error";

export interface CoverUrlResult {
  url: string | null;
  status: CoverStatus;
}

export function useCoverUrl(isbn: string): CoverUrlResult {
  const [state, setState] = useState<CoverUrlResult>({ url: null, status: "loading" });

  useEffect(() => {
    if (!isbn) {
      setState({ url: null, status: "error" });
      return;
    }

    const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    fetch(coverUrl, { method: "HEAD", signal: controller.signal })
      .then((res) => {
        const contentType = res.headers.get("content-type") ?? "";
        if (res.ok && contentType.startsWith("image/")) {
          setState({ url: coverUrl, status: "ready" });
        } else {
          setState({ url: null, status: "error" });
        }
      })
      .catch(() => {
        setState({ url: null, status: "error" });
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [isbn]);

  return state;
}
