export function formatEuro(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  const euros = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const frac = String(abs % 100).padStart(2, "0");
  return `${sign}${euros},${frac} €`;
}

export function formatPercentBps(bps: number): string {
  const whole = Math.floor(bps / 100);
  const frac = bps % 100;
  if (frac === 0) return String(whole);
  return `${whole},${String(frac).replace(/0+$/, "")}`;
}

export function referrerPieceCopy(rewardCents: number, bps: number, baseCents: number): string {
  return `Premio a chi ti segnala: ${formatPercentBps(bps)}% · ${formatEuro(rewardCents)} a chi ti segnala (base ${formatEuro(baseCents)})`;
}

export function couponPieceCopy(discountCents: number, bps: number, priceCents: number): string {
  return `sconto ${formatEuro(discountCents)} con codice al ${formatPercentBps(bps)}%, prezzo ${formatEuro(priceCents)}`;
}
