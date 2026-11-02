# Decisioni da ChatGPT vs roadmap Mercur

**Scopo:** trasformare il dump ChatGPT in **scelte firmabili** prima di scrivere cashback/referral.  
**Stack:** Mercur + Medusa + storefront Next (`:3002`) — **non** riscrivere su Emergent/Supabase.  
**Ordine:** catalogo → Stripe → vendite vere → cashback → referral → app.  
**Fuori MVP:** token, Energy Box, oro/MiCA, villaggi.

ChatGPT mescola 3 piani: **software** (noi), **legale/fiscale** (avvocato), **visione industriale** (dopo).  
Dove c’è contraddizione, papà sceglie **una sola regola ufficiale**.

---

## Scelte da firmare (Antonino)

> **Sprint 15 gg:** default sotto già in vigore per il codice. Antonino conferma con  
> “OK DEFAULT” su email/WA (`PROTOCOLLO-ESCALATION-ANTONINO.md`) o override in una riga.

### A) Cashback

| # | Domanda | Opzioni | Scelta |
|---|---------|---------|--------|
| A1 | Forma del beneficio | Solo credito interno checkout / Anche prelievo contanti | ☑ **credito interno** (default sprint) |
| A2 | Base calcolo | % su prezzo vendita / % su margine | ☑ **prezzo vendita** (default sprint) |
| A3 | % tipica (configurabile, non hardcode) | es. 5–35% — valore ufficiale: ____ | ☑ **5%** (default sprint) |
| A4 | Giorni sblocco dopo consegna | 14 / 30 / altro: ____ | ☑ **14** (default sprint) |
| A5 | Reso / refund | Annulla pending + available non usato | ☑ **sì** (default sprint) |

**Raccomandazione MVP:** A1 = solo credito interno → niente KYC prelievo in fase 1.

### B) Referral

| # | Domanda | Opzioni | Scelta |
|---|---------|---------|--------|
| B1 | Livelli | **A)** single-tier (più sicuro) / **B)** multilivello 5/2/1 | ☑ **A single-tier** (default sprint) |
| B2 | Quando matura | Solo ordine pagato + non rimborsato | ☑ **sì** (default sprint) |
| B3 | Self-referral | Bloccato | ☑ **sì** (default sprint) |

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
