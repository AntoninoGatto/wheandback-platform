export const PARTNER_CONTRACT = {
  VERSION: "2026-06-1",
  TITLE: "Contratto di Convenzionamento Partner Whe&Back®",
  HOLDER: "Buy All Free LTD",
  PLATFORM: "Whe&Back®",
  CONTRACT_EMAIL: "partners@wheback.it",
} as const;

export const PARTNER_CONTRACT_SECTIONS = [
  {
    title: "1. Oggetto",
    body:
      "Il Partner convenzionato potrà vendere i propri prodotti sul marketplace Whe&Back®, gestito da Buy All Free LTD, secondo le regole commerciali, etiche e tecniche della piattaforma.",
  },
  {
    title: "2. Requisiti prodotti",
    body:
      "Ogni prodotto deve rispettare categorie ammesse, blacklist aziendale, margine minimo del 50% sul prezzo di vendita, cashback tra 5% e 35%, stock reale e descrizione veritiera. I prodotti non conformi non possono essere pubblicati.",
  },
  {
    title: "3. Responsabilità del Partner",
    body:
      "Il Partner garantisce titolarità/legittima disponibilità dei prodotti, conformità normativa (CE, sicurezza, etichettatura), gestione ordini, resi e assistenza entro i tempi concordati. È responsabile dei contenuti caricati.",
  },
  {
    title: "4. Pagamenti e provvigioni",
    body:
      "Buy All Free LTD gestisce incasso dal cliente finale. I pagamenti al Partner avvengono secondo i termini contrattuali concordati e documentati in fattura. Referral, cashback e donazione benefica (1%) sono gestiti dalla piattaforma.",
  },
  {
    title: "5. Consegna",
    body:
      "Il Partner si impegna a rispettare i tempi di evasione indicati in piattaforma (SLA concordato). Ritardi ripetuti possono comportare sospensione del catalogo.",
  },
  {
    title: "6. Durata e recesso",
    body:
      "Il convenzionamento ha durata indeterminata salvo diverso accordo. Ciascuna parte può recedere con preavviso scritto di 30 giorni, fermo restando l'adempimento degli ordini in corso.",
  },
  {
    title: "7. Privacy e dati",
    body:
      "Le parti trattano i dati personali in conformità al GDPR e all'informativa privacy della piattaforma.",
  },
  {
    title: "8. Accettazione",
    body:
      "L'accettazione digitale in piattaforma costituisce manifestazione di volontà contrattuale. Il Partner invierà copia firmata del presente contratto a Buy All Free LTD entro 10 giorni lavorativi dall'attivazione.",
  },
] as const;

export const PARTNER_PRODUCT_RULES_SUMMARY = [
  "Categorie ammesse: largo consumo, oggettistica, pet, elettrica/elettronica, casa, hobby, giocattoli, salute, sport, ufficio.",
  "Esclusi: abbigliamento, scarpe, borse, accessori donna, intimo e prodotti in blacklist etica.",
  "Prezzo di acquisto ≤ 50% del prezzo di vendita (margine minimo 50%).",
  "Cashback referral: da 5% a 35%.",
  "Prezzo minimo di vendita: €3.",
  "Stock reale obbligatorio; ogni prodotto passa approvazione admin prima della pubblicazione.",
] as const;
