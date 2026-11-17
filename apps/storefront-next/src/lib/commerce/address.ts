export type ItAddress = {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
  province: string;
  phone: string;
  country_code: string;
  codice_fiscale?: string;
};

const CAP = /^\d{5}$/;
const PROVINCE = /^[A-Za-z]{2}$/;
const PHONE = /^[0-9+\s]{6,20}$/;
const CF = /^[A-Za-z0-9]{16}$/;

export function validateItAddress(input: ItAddress): string[] {
  const errors: string[] = [];
  if (!input.first_name?.trim()) errors.push("Nome obbligatorio");
  if (!input.last_name?.trim()) errors.push("Cognome obbligatorio");
  if (!input.address_1?.trim()) errors.push("Indirizzo obbligatorio");
  if (!input.city?.trim()) errors.push("Città obbligatoria");
  if (!CAP.test(input.postal_code || "")) errors.push("CAP non valido");
  if (!PROVINCE.test(input.province || "")) errors.push("Provincia non valida");
  if (!PHONE.test(input.phone || "")) errors.push("Telefono non valido");
  if ((input.country_code || "").toLowerCase() !== "it") errors.push("Paese deve essere IT");
  if (input.codice_fiscale && !CF.test(input.codice_fiscale)) {
    errors.push("Codice fiscale non valido");
  }
  return errors;
}

export const SHIPPING_STANDARD_EUR = 5.9;
export const SHIPPING_EXPRESS_EUR = 9.9;
export const FREE_SHIPPING_THRESHOLD_EUR = 49;

export function shippingLabel(method: "standard" | "express", productGrossEur: number): string {
  if (method === "standard" && productGrossEur >= FREE_SHIPPING_THRESHOLD_EUR) {
    return "Spedizione standard inclusa nel servizio";
  }
  const amount = method === "express" ? SHIPPING_EXPRESS_EUR : SHIPPING_STANDARD_EUR;
  return `€ ${amount.toFixed(2).replace(".", ",")} (importo placeholder)`;
}
