export function CashbackBadge({ label }: { label: string }) {
  if (!label) return null;
  return (
    <span className="inline-flex rounded-full bg-[#BEEE62] px-2 py-1 text-xs font-semibold text-[#253866]">
      {label}
    </span>
  );
}
