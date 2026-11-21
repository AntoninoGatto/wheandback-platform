import assert from "node:assert/strict";
import test from "node:test";
import { couponPieceCopy, referrerPieceCopy } from "./offers-format.ts";

test("a 122 euro lamp states the referrer reward and the 13% code", () => {
  assert.equal(
    referrerPieceCopy(3500, 3500, 10000),
    "Premio a chi ti segnala: 35% · 35,00 € a chi ti segnala (base 100,00 €)"
  );
  assert.equal(
    couponPieceCopy(1586, 1300, 10614),
    "sconto 15,86 € con codice al 13%, prezzo 106,14 €"
  );
});
