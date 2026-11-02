# Piano team Whe&Back — 4 mesi (Gabriele · Cursor · Grok Bot · Antonino)

> **OVERRIDE ATTIVO (nov 2026):** sprint compresso **15 giorni** — vedi  
> [`SPRINT-15-GIORNI-OPERATIVO.md`](./SPRINT-15-GIORNI-OPERATIVO.md),  
> [`GROK-BOT-COLLEGAMENTO.md`](./GROK-BOT-COLLEGAMENTO.md),  
> [`PROTOCOLLO-ESCALATION-ANTONINO.md`](./PROTOCOLLO-ESCALATION-ANTONINO.md).  
> **Grok Bot** = app teammate (computer cloud), **non** il modello Grok nell’IDE.

**Obiettivo (piano lungo, se lo sprint slitta):** negozio + cashback + referral.  
**App mobile:** fuori.  
**Stack:** Mercur + storefront (`apps/storefront-next`) + Vercel + API hostata. Non prototipo `:3000`.

---

## 1) Chi fa cosa (i 4)

| Ruolo | Chi | Responsabilità |
|-------|-----|----------------|
| **Ops / click** | Gabriele | Account (Stripe, Vercel, GoDaddy, host API), env, test browser, 5 h/sett, coordina papà |
| **Dev A** | Cursor (questa chat / Composer) | Codice, fix, docs, commit/push, guide click-by-click |
| **Dev B** | **Grok Bot** (app teammate) | Computer cloud 24/7; codice via Cloud Agent su GitHub; email/WA ad Antonino |
| **Business** | Antonino (papà) | Fornitori, catalogo vero, margini, ok live, **regole ufficiali cashback/referral**, testi azienda |

**Regola d’oro:** Cursor e Grok Bot **non** si contraddicono sul processo. Fonte di verità = repo GitHub + docs in `docs/`. Decisioni business = solo Antonino (scritte in `DECISIONI-DA-CHATGPT-VS-ROADMAP.md`).

---

## 2) Come collegare Grok Bot a questo progetto

Istruzioni complete: **[`GROK-BOT-COLLEGAMENTO.md`](./GROK-BOT-COLLEGAMENTO.md)**.

In sintesi: app **Grok Bot** (non modello IDE) → GitHub Integration su `AntoninoGatto/wheandback-platform` → Bot “WheBack” → Cloud Agent per il codice → email `@mail.grokbot.com` / Gmail + WhatsApp sul computer del Bot.

**Sincronia IDE ↔ Grok Bot:** tutto passa da **GitHub** (PR/branch). File solo locali non pushati il Bot non li vede.

---

## 3) Ritmo settimanale (5 h Gabriele)

| Slot | Tempo | Cosa |
|------|-------|------|
| Prep AI (senza Gabriele) | quando serve | Cursor/Grok preparano codice/docs |
| Sessione Gabriele | **5 h totali/sett.** | Click, test, papà, deploy check |
| Sync papà | 15–30 min/sett. (anche WhatsApp) | 1 decisione o 1 blocco fornitore |

**Template sessione Gabriele (es. 1 blocco da 2–2,5 h × 2):**
1. `git pull`  
2. AI dice i click della settimana  
3. Tu esegui (Stripe / DNS / host)  
4. Smoke test URL  
5. AI commit+push + aggiorna checklist  

---

## 4) Roadmap 4 mesi (calendario)

### Mese 1 — Negozio tecnico online
- [ ] Stripe **test** end-to-end (Region + pagamento)  
- [ ] Checkout: indirizzo + shipping IT  
- [ ] Email ordine  
- [ ] API Mercur su host pubblico + CORS  
- [ ] Storefront Vercel + env produzione  
- [ ] DNS `wheback.com` + `api.wheback.com`  
**Owner click:** Gabriele · **Codice:** Cursor/Grok · **Ok business:** Antonino (categorie minime)

### Mese 2 — Vendite pilota + regole loyalty
- [ ] Privacy / T&C / resi in footer (testi Antonino o Iubenda)  
- [ ] Stripe **live** + 1–3 ordini pilota  
- [ ] Antonino firma scelta A/B in `DECISIONI-DA-CHATGPT-VS-ROADMAP.md` (cashback + referral 1 livello)  
- [ ] Catalogo: sostituire demo con prodotti veri (anche 10–20 SKU)  
**Owner:** Gabriele + Antonino · **Codice:** Cursor/Grok

### Mese 3 — Cashback MVP
- [ ] Ledger cashback (pending / available / used / cancelled)  
- [ ] % configurabile + sblocco dopo N giorni  
- [ ] UI cliente storefront + annullo su refund  
- [ ] Solo **credito interno** (niente prelievo)  
**Owner codice:** Cursor/Grok · **Regole:** Antonino · **Test:** Gabriele

### Mese 4 — Referral + clienti regolari
- [ ] Link/codice referral 1 livello  
- [ ] Attribuzione + blocco self-referral  
- [ ] Premio via ledger cashback  
- [ ] Soft traffic / primi clienti regolari  
- [ ] Check margine e logistica con Antonino  
**Owner:** tutti e 4

---

## 5) Canali e “chi informa chi”

| Evento | Chi avvisa |
|--------|------------|
| Push / deploy | Cursor o Grok in chat (“pushato, controlla Vercel”) |
| Serve un click tuo | AI in chat con lista numerata |
| Serve decisione papà | Gabriele → Antonino (anche inoltrando il doc) |
| Blocco (Stripe, DNS, build) | Screenshot in chat → AI sistema |

**Doc vivi da spuntare:**
- `PERCORSO-PUBBLICAZIONE-STEP-BY-STEP.md`  
- `DECISIONI-DA-CHATGPT-VS-ROADMAP.md`  
- Questo file  

---

## 6) Cosa non fare

- Non dare a Grok/Cursor lavoro su HSKacer in chat Whe&Back (cartella sbagliata).  
- Non implementare multilivello referral senza ok scritto Antonino + legale.  
- Non aprire ads pesanti prima di 1 ordine pilota live ok.  
- Non commitare `.env` / chiavi.

---

## 7) Prossima azione concreta

1. **Gabriele:** apri una chat Grok Bot su `wheback-platform` e digli di leggere questo file.  
2. **Antonino:** 1 fornitore + firme A1–B1 in `DECISIONI-DA-CHATGPT-VS-ROADMAP.md` (anche bozza).  
3. **Prossima sessione 5 h:** Step 3 percorso = **Stripe test** (Cursor/Grok preparano, tu click).

Aggiornato: 2026-11-02
