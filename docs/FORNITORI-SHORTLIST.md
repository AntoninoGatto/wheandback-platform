# Shortlist fornitori dropshipping — Whe&Back®

**Stato:** bozza operativa (post-macchina, step 1–2)  
**Regola:** **non** usare CJ Dropshipping come cuore del catalogo.  
**Obiettivo:** scegliere **1–3** fornitori affidabili (EU / IT / US) con spedizione sensata verso IT/EU.

**2026-10-23:** shop ha ≥10 prodotti **demo** (script `seed-step2-catalog.ts`) per sbloccare Stripe.  
Slot fornitori sotto restano **TBD** finché Antonino non conferma nomi reali.

---

## Criteri di selezione (obbligatori)

| Criterio | Passa se… | Scarta se… |
|----------|-----------|------------|
| Geografia | Magazzino EU e/o IT, oppure US con tempi dichiarati verso IT | Solo Cina senza hub EU, tempi > 15–20 gg senza comunicazione chiara |
| Spedizione IT/EU | Tracking, costi prevedibili, resi gestibili | Nessun tracking / costi nascosti |
| Qualità catalogo | Foto reali, descrizioni utili, brand/private label accettabili | Solo stock generico “gadget spazzatura” |
| Margine | Dopo costo prodotto + spedizione resta margine target (da definire con Antonino) | Margine < soglia dopo spedizione |
| Operatività | CSV e/o API e/o portale ordine chiaro | Solo chat manuale senza process |
| Affidabilità | Recensioni/B2B referenze, SLA dichiarato | Storico scam / no P.IVA UE quando serve |

**Extra positivi:** magazzino Italia/Germania/NL/PL; integrazioni Shopify/Woo già mature; supporto IT/EN.

---

## Candidati da valutare (1–3 da confermare)

> Non sono “integrati”: sono una shortlist da validare con account test / campioni / 5–10 SKU.

| # | Tipo | Perché candidabile | Azione |
|---|------|--------------------|--------|
| 1 | **Hub EU / 3PL dropship EU** (es. player con warehouse EU dedicati al DS) | Tempi IT migliori, meno “Cina diretta” | Aprire account, chiedere listino + tempi IT + CSV sample |
| 2 | **Fornitore IT / EU di nicchia** (categoria scelta da Antonino: casa, sport, beauty, ecc.) | Qualità e resi più semplici | Contatto commerciale + MOQ + listino |
| 3 | **Fornitore US** (solo se ha stock EU o shipping EU accettabile) | Ampiezza catalogo | Solo se tempi/costi IT ok; altrimenti scartare |

**Partner marketplace (non DS puro):** TGP e simili → onboarding via `http://localhost:9000/seller` (vedi sezione partner in TODO).

---

## Checklist validazione fornitore (prima di import massivo)

- [ ] Account sandbox / trial creato
- [ ] Ricevuto **CSV di esempio** (o API docs) con: SKU, titolo, prezzo costo, peso, stock, immagini
- [ ] Test spedizione IT: costo + ETA dichiarati
- [ ] 3–5 SKU campione valutati con [`REGOLE-QUALITA-IMPORT.md`](./REGOLE-QUALITA-IMPORT.md)
- [ ] Margine calcolato (costo + ship vs prezzo vendita)
- [ ] Decisione: **OK catalogo** / **solo test** / **NO**

---

## Decisione da prendere con Antonino

1. Categorie prioritarie del primo catalogo (max 2–3).  
2. Margine minimo netto accettabile.  
3. Preferenza: solo EU warehouse vs mix US.  
4. Nome dei 1–3 fornitori scelti (compilare sotto).

| Slot | Fornitore scelto | Paese warehouse | Contatto | Stato |
|------|------------------|-----------------|----------|--------|
| 1 | _TBD_ | | | ☐ |
| 2 | _TBD_ | | | ☐ |
| 3 | _TBD_ | | | ☐ |

---

## Collegamenti

- Ingresso prodotti: [`INGRESSO-PRODOTTI-MERCUR.md`](./INGRESSO-PRODOTTI-MERCUR.md)  
- Regole qualità: [`REGOLE-QUALITA-IMPORT.md`](./REGOLE-QUALITA-IMPORT.md)  
- TODO vivo: [`TO-DO-LIST-progetto-wheback.md`](./TO-DO-LIST-progetto-wheback.md)
