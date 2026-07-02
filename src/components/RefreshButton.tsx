"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleClick() {
    setState("loading");
    try {
      const res = await fetch("/api/refresh-prices");
      if (!res.ok) throw new Error();
      setState("done");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <button
      className="pb-fbtn"
      onClick={handleClick}
      disabled={state === "loading"}
      type="button"
    >
      {state === "loading" ? "刷新緊…" : state === "error" ? "刷新失敗，再試" : "🔄 即刻刷新價位"}
    </button>
  );
}
