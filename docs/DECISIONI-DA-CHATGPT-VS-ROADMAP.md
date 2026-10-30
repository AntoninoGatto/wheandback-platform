# Decisioni da ChatGPT vs roadmap Mercur

**Scopo:** trasformare il dump ChatGPT in **scelte firmabili** prima di scrivere cashback/referral.  
**Stack:** Mercur + Medusa + storefront Next (`:3002`) — **non** riscrivere su Emergent/Supabase.  
**Ordine:** catalogo → Stripe → vendite vere → cashback → referral → app.  
**Fuori MVP:** token, Energy Box, oro/MiCA, villaggi.

ChatGPT mescola 3 piani: **software** (noi), **legale/fiscale** (avvocato), **visione industriale** (dopo).  
Dove c’è contraddizione, papà sceglie **una sola regola ufficiale**.

---

## Scelte da firmare (Antonino)

### A) Cashback

| # | Domanda | Opzioni | Scelta |
|---|---------|---------|--------|
| A1 | Forma del beneficio | Solo credito interno checkout / Anche prelievo contanti | ☐ |
| A2 | Base calcolo | % su prezzo vendita / % su margine | ☐ |
| A3 | % tipica (configurabile, non hardcode) | es. 5–35% — valore ufficiale: ____ | ☐ |
| A4 | Giorni sblocco dopo consegna | 14 / 30 / altro: ____ | ☐ |
| A5 | Reso / refund | Annulla pending + available non usato | ☐ sì (consigliato) |

**Raccomandazione MVP:** A1 = solo credito interno → niente KYC prelievo in fase 1.

### B) Referral

| # | Domanda | Opzioni | Scelta |
|---|---------|---------|--------|
| B1 | Livelli | **A)** single-tier (più sicuro) / **B)** multilivello 5/2/1 | ☐ |
| B2 | Quando matura | Solo ordine pagato + non rimborsato | ☐ |
| B3 | Self-referral | Bloccato | ☐ sì |

**Finché B1 non è firmato (e se multi: parere legale), non si codifica il carpeto.**

### C) Modello economico

| # | Domanda | Note | Scelta |
|---|---------|------|--------|
| C1 | Split tipo 50/35/1/14 | Validare con **margini reali** fornitore, non teorici | ☐ ok / ☐ rivedere |
| C2 | Margine minimo pubblicazione | Vedi `REGOLE-QUALITA-IMPORT.md` — soglia: ____ | ☐ |
| C3 | Donazione 1% | Contatore manuale/semi-auto all’inizio | ☐ |

### D) Contenuti & legale (non codice Cursor)

| # | Voce | Chi | Stato |
|---|------|-----|-------|
| D1 | T&C cashback come “credito / sconto differito” | Legale | ☐ |
| D2 | Privacy / Cookie (Iubenda o equivalente) | Legale / Iubenda | ☐ |
| D3 | Testi Chi siamo / FAQ / 1% Aladino ufficiali | Papà | ☐ |
| D4 | Età minima 18 a registrazione/checkout | Cursor dopo ok papà | ☐ |

---

## Cosa Cursor può fare (quando sbloccato)

| Dopo… | Implementazione |
|-------|-----------------|
| Vendite vere (step 4) | Ledger cashback: pending / available / used / cancelled |
| Cashback live | Referral link + attribuzione (secondo B1) |
| Mai in MVP | Token, Energy Box, rebuild Emergent, KYC prelievo |

Dettaglio gated: `CASHBACK-DOPO-VENDITE.md`, `REFERRAL-DOPO-CASHBACK.md`, `APP-MOBILE-ULTIMA.md`.

---

## Firma

| Ruolo | Nome | Data | Note |
|-------|------|------|------|
| Business | Antonino | | |
| Ops / repo | Gabriele | | |
| Legale (se B1=multi o prelievi) | | | |
