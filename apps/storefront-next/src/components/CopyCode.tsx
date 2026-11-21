"use client";

import { useState } from "react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="font-semibold text-[#253866]"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      {code}
      <span className="ml-2 text-xs font-normal text-[#00B295]">{copied ? "Copiato" : "Copia"}</span>
    </button>
  );
}
