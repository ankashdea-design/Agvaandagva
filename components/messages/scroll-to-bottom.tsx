"use client";

import { useEffect, useRef } from "react";

export function ScrollToBottom({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollIntoView({ block: "end" });
  }, []);

  return <div ref={ref}>{children}</div>;
}
