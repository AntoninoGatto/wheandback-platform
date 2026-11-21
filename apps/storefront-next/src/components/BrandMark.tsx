import { brandSymbol } from "@/lib/company";

/** Visible name is WheBack. The mark follows TRADEMARK_LICENSE_SIGNED. */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      WheBack<sup className="text-[0.55em]">{brandSymbol()}</sup>
    </span>
  );
}
