import assert from "node:assert/strict";
import test from "node:test";
import { shippingLabel, validateItAddress } from "./address.ts";

const address = {
  first_name: "Ada",
  last_name: "Lovelace",
  address_1: "Via Roma 1",
  city: "Milano",
  postal_code: "20121",
  province: "MI",
  phone: "3331234567",
  country_code: "it",
};

test("Italian address validation", () => {
  assert.deepEqual(validateItAddress(address), []);
  assert.ok(validateItAddress({ ...address, postal_code: "12" }).includes("CAP non valido"));
});

test("shipping copy never says the shipment is free", () => {
  const label = shippingLabel("standard", 50);
  assert.match(label, /inclusa nel servizio/);
  assert.equal(/gratis|costo zero/i.test(label), false);
  assert.match(shippingLabel("express", 80), /placeholder/);
});
