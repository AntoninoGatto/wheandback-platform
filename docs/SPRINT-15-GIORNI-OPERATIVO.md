# Sprint 15 giorni — shop + cashback + referral

**Avvio:** 2026-11-02 · **Deadline:** ~2026-11-17  
**Obiettivo:** negozio online funzionante + **cashback MVP** + **referral 1 livello**.  
**Sostituisce** il piano “4 mesi / 5 h” per questa finestra. Documento team precedente: `PIANO-TEAM-4-MESI.md` (riferimento ruoli).

---

## Modello operativo (i 4)

| Ruolo | Chi | Come lavora in questi 15 giorni |
|-------|-----|----------------------------------|
| **Motore codice** | **Grok Bot** (Cursor + modello Grok) | Sessioni lunghe sul repo `wheback-platform`; implementa, pusha, aggiorna stato |
| **Backup / review** | Cursor (Composer) | Allineamento, review, sblocchi difficili, stesso repo |
| **Ops click** | Gabriele | Account, DNS, Stripe, host, auth GitHub, conferma deploy |
| **Business / firma** | Antonino | Risponde a email/WhatsApp: regole cashback/referral, fornitori, ok live |

**Canali umani (solo questi):**
- Email: `info.buyallfree@gmail.com`
- WhatsApp Antonino: `+39 347 229 5125`

Protocollo messaggi: `PROTOCOLLO-ESCALATION-ANTONINO.md`.

---

## Cosa Grok Bot può e non può fare da solo

| Può | Non può (serve setup o umano) |
|-----|-------------------------------|
| Codificare cashback/referral/storefront/API | Mandare WhatsApp “magicamente” senza API collegata |
| Aprire PR / commit (se git auth ok) | Click Stripe Dashboard / GoDaddy / Vercel account Gabriele |
| Scrivere bozze email/WA e (con Gmail collegato) inviare email | Firnare regole business al posto di Antonino |
| Aggiornare checklist e `STATO-ATTUALE.md` | Girare 24/7 se Cursor/PC/Cloud Agent è spento |

**“Tutto il giorno” in pratica**
1. PC acceso + chat Agent con modello **Grok** sul folder `C:\Progetti\wheback-platform`, oppure  
2. **Cloud Agents / Automations** Cursor sul repo GitHub (digest + lavoro a orari fissi), oppure  
3. Entrambi: Grok in giornata continua + digest serale automatico a email.

WhatsApp verso papà: finché non c’è un bridge (es. CallMeBot / Twilio WhatsApp), Grok **prepara il testo** e lo manda via **email** a `info.buyallfree@gmail.com` (e/o Gabriele inoltra su WA in 1 tap). Vedi protocollo.

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

**Override:** messaggio di Antonino su email/WA con “A3=10%” ecc. → Grok aggiorna config + conferma reply.

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
| Fine ogni blocco lavoro (~2–4 h) | Email (preferito) | Grok → `info.buyallfree@gmail.com` | Stato + prossimo step + se serve click |
| Blocco che ferma il codice | Email + testo WA (inoltro) | Grok → Gabriele/Antonino | Domanda sì/no con default proposto |
| Mattina (opz.) | Email digest | Automation / Grok | Cosa fatto ieri / oggi / bloccanti |
| Solo urgenze | WhatsApp | Umano o bridge | Max 1–2 msg/giorno salvo emergenza |

---

## Checklist avvio (Gabriele, una volta)

1. [ ] Aprire Cursor su `wheback-platform`, chat Agent, modello **Grok**  
2. [ ] Dire a Grok: *segui `docs/SPRINT-15-GIORNI-OPERATIVO.md` e `docs/PROTOCOLLO-ESCALATION-ANTONINO.md`*  
3. [ ] Collegare Gmail in Cursor (MCP Gmail) sull’account che può scrivere a `info.buyallfree@gmail.com` **oppure** da cui inviare  
4. [ ] GitHub: push funzionante (account con accesso a `AntoninoGatto/wheandback-platform`)  
5. [ ] Inviare ad Antonino il messaggio di avvio sprint (template nel protocollo)  
6. [ ] (Opz.) Bridge WhatsApp CallMeBot/Twilio → poi Grok può notificare anche su WA  

---

## Definition of done (17 nov)

- [ ] Acquisto reale/test live ok  
- [ ] Cashback accredita e si usa in checkout  
- [ ] Referral attribuito e premio sul ledger  
- [ ] Antonino ha ricevuto aggiornamenti e ha potuto dire sì/no alle regole  

Aggiornato: 2026-11-02
