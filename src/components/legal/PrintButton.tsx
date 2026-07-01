"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200"
      style={{ color: "#253866" }}
    >
      Stampa / Salva PDF
    </button>
  );
}
