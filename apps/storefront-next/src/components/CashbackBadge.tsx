export function CashbackBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#e7f8f5] px-2 py-1 text-xs font-semibold text-[#0b6b5c]">
      {label}
    </span>
  );
}
