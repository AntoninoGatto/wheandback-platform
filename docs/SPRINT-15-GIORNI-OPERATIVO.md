# Sprint 15 giorni — shop + cashback + referral

**Avvio:** 2026-11-02 · **Deadline:** ~2026-11-17  
**Obiettivo:** negozio online funzionante + **cashback MVP** + **referral 1 livello**.  
**Sostituisce** il piano “4 mesi / 5 h” per questa finestra. Documento team precedente: `PIANO-TEAM-4-MESI.md` (riferimento ruoli).

**Grok Bot** = app teammate Cursor (computer cloud), **non** il modello Grok nell’IDE.  
Setup: [`GROK-BOT-COLLEGAMENTO.md`](./GROK-BOT-COLLEGAMENTO.md).

---

## Modello operativo (i 4)

| Ruolo | Chi | Come lavora in questi 15 giorni |
|-------|-----|----------------------------------|
| **Motore 24/7** | **Grok Bot** (app teammate, computer cloud) | Codice via Cloud Agent su GitHub; email; WhatsApp; continua a PC spento |
| **Backup locale** | Cursor IDE (questa chat) | Docs, review, sblocchi quando Gabriele è al PC |
| **Ops click** | Gabriele | Approva carte Grok Bot, GitHub, DNS, Stripe, QR WhatsApp |
| **Business / firma** | Antonino | Risponde email/WhatsApp: regole cashback/referral, fornitori, ok live |

**Canali umani (solo questi):**
- Email: `info.buyallfree@gmail.com` (+ eventuale `*@mail.grokbot.com` del Bot)
- WhatsApp Antonino: `+39 347 229 5125`

Protocollo: `PROTOCOLLO-ESCALATION-ANTONINO.md`.

---

## Cosa Grok Bot può e non può fare da solo

| Può (dopo setup) | Non può / serve umano |
|------------------|------------------------|
| Codice su GitHub via Cloud Agent → branch/PR | Vedere file solo locali non pushati |
| Email da `@mail.grokbot.com` o Gmail collegato | Saltare approval su email da routine |
| WhatsApp (Web/wacli sul suo computer) | WA senza primo QR / re-link post-refresh |
| Routine + skill, lavoro a laptop chiuso | Click 2FA / captcha / account non collegati |
| Aggiornare stato e chiedere conferme ad Antonino | Firmare regole business al posto suo |

---

## Default MVP (valgono subito; Antonino può cambiare via WA/email)

Finché non arriva una risposta diversa, si implementa così (allineato a `DECISIONI-DA-CHATGPT-VS-ROADMAP.md`):

| Codice | Default sprint |
|--------|----------------|
| A1 | Solo **credito interno** checkout (no prelievo) |
| A2 | % su **prezzo vendita** |
| A3 | **5%** configurabile |
| A4 | Sblocco **14 giorni** dopo paid/captured |
| A5 | Refund → annulla pending / available non usato |
| B1 | Referral **1 livello** (single-tier) |
| B2 | Premio solo ordine **pagato** non rimborsato |
| B3 | Self-referral **bloccato** |

**Override:** messaggio di Antonino su email/WA con “A3=10%” ecc. → Grok Bot aggiorna config + conferma reply.

---

## Calendario compresso (15 giorni)

### Giorni 1–3 — Negozio pagabile
- Stripe test E2E, checkout+shipping IT, email ordine  
- API Mercur host pubblico + CORS + env Vercel  
- DNS minimo (`wheback.com` / `api…`)  
**Escalation umana:** account Stripe/host/DNS (Gabriele); ok categorie minime (Antonino)

### Giorni 4–6 — Live pilota + sblocco loyalty
- Privacy/T&C footer (testi o placeholder legale)  
- Stripe live + ≥1 ordine pilota  
- Catalogo: sostituire demo con SKU reali (anche pochi)  
**Escalation:** Antonino conferma default A/B (anche “ok ai default sprint”)

### Giorni 7–11 — Cashback MVP
- Modulo ledger: pending / available / used / cancelled  
- % + delay da config  
- UI storefront + annullo refund  
- Solo credito interno  

### Giorni 12–14 — Referral 1 livello
- Codice/link, attribuzione, anti self-referral  
- Premio sul ledger cashback  
- UI referral  

### Giorno 15 — Collaudo
- Checklist E2E: acquisto → cashback → referral → redeem  
- Fix critici + push deploy  
- Messaggio chiusura a Antonino (stato + cosa manca fuori MVP)

**Fuori sprint:** app mobile, multilivello, prelievo cash, token, ads pesanti.

---

## Ritmo comunicazione

| Quando | Canale | Chi | Contenuto |
|--------|--------|-----|-----------|
| Fine ogni blocco lavoro (~2–4 h) | Email | **Grok Bot** → `info.buyallfree@gmail.com` | Stato + prossimo step + se serve click |
| Blocco che ferma il codice | Email + WhatsApp | Grok Bot → Antonino/Gabriele | Domanda sì/no con default proposto |
| Mattina (opz.) | Email digest | Grok Bot (routine) | Cosa fatto ieri / oggi / bloccanti |
| Solo urgenze | WhatsApp | Grok Bot (computer cloud) | Max 1–2 msg/giorno salvo emergenza |

---

## Checklist avvio (Gabriele, una volta)

Seguire per intero **`GROK-BOT-COLLEGAMENTO.md`**. In sintesi:

1. [ ] App **Grok Bot** + Bot dedicato **WheBack**  
2. [ ] cursor.com → Integrations → **GitHub** → `AntoninoGatto/wheandback-platform`  
3. [ ] Email Bot `@mail.grokbot.com` e/o Connect **Gmail** `info.buyallfree@gmail.com`  
4. [ ] WhatsApp Web/wacli sul computer del Bot → test a papà  
5. [ ] Messaggio di avvio sprint ad Antonino (template nel protocollo)  
6. [ ] Prompt: *Inizia sprint, primo blocco Stripe test*  

---

## Definition of done (17 nov)

- [ ] Acquisto reale/test live ok  
- [ ] Cashback accredita e si usa in checkout  
- [ ] Referral attribuito e premio sul ledger  
- [ ] Antonino ha ricevuto aggiornamenti e ha potuto dire sì/no alle regole  

Aggiornato: 2026-11-02
