# Protocollo escalation — Antonino / Gabriele

**Destinatari umani**
- Email progetto: `info.buyallfree@gmail.com`
- WhatsApp Antonino: `+39 347 229 5125`
- Ops: Gabriele (inoltra WA se Grok non ha ancora bridge WhatsApp)

Usare **solo** per conferme, stati di avanzamento e interventi umani. Niente spam: max ~3 email/giorno salvo blocco critico.

---

## Quando contattare

| Motivo | Canale | Urgenza |
|--------|--------|---------|
| Aggiornamento stato (fatto / in corso / prossimo) | Email | Normale |
| Serve firma regola cashback/referral (A1–B3) | Email + testo WA | Alta |
| Serve click Gabriele (Stripe, DNS, Vercel, host) | Email a info… + CC/nota per Gabriele | Alta |
| Deploy fallito / sito down | Email + WA | Critica |
| Domanda catalogo / fornitore / prezzo | Email o WA | Media |

---

## Formato email (obbligatorio)

**Oggetto:** `[Whe&Back][Sprint15] Giorno N — <tema>`

```
Ciao Antonino / Gabriele,

STATO: <1 riga>
FATTO: <bullet max 5>
BLOCCATO DA UMANO: <sì/no + cosa>
DECISIONE RICHIESTA: <sì/no>
  Domanda: ...
  Default se non rispondi entro 24h: <default sprint>
PROSSIMO STEP TECNICO: <1 riga>
Link utili: <Vercel / PR / checklist>

— Grok Bot (Cursor) · Whe&Back
```

Se **nessuna decisione** richiesta: comunque 1 email di stato a fine giornata lavorativa.

---

## Formato WhatsApp (corto)

```
Whe&Back D<N>
Stato: …
Serve da te: SÌ/NO — …
Default se ok silenzio 24h: …
Dettagli: email [oggetto]
```

Finché non c’è API WhatsApp: Grok mette il testo WA in coda all’email con oggetto `[WA-COPY]` e Gabriele inoltra in 10 secondi.

---

## Bridge WhatsApp (opzionale, dopo)

1. **CallMeBot** (semplice, personale): Antonino attiva il bot una volta → API key → env `WHATSAPP_CALLMEBOT_KEY` (mai in git).  
2. **Twilio WhatsApp** (più solido, a pagamento).  

Finché non configurato: **email = canale ufficiale**; WA = inoltro manuale.

---

## Template — messaggio di AVVIO sprint (da mandare ORA)

**WhatsApp / email ad Antonino:**

```
Ciao Papà,

da oggi partiamo con uno sprint di 15 giorni su Whe&Back:
negozio online + cashback + referral 1 livello (entro ~17 novembre).

Grok Bot (AI su Cursor) lavorerà sul codice e ti scriverà su
info.buyallfree@gmail.com (e io ti inoltrerò i pezzi importanti su WhatsApp)
per stato avanzamento e per chiederti sì/no sulle regole.

Default finché non dici altrimenti:
• cashback = solo credito interno, 5%, sblocco 14 giorni, annullo su reso
• referral = 1 solo livello, premio su ordine pagato, no auto-invito

Se ti va bene rispondi “OK DEFAULT”.
Se vuoi cambiare %, giorni o altro, rispondi in una riga (es. “A3=10%”).

Gabriele
```

---

## Template — conferma regole (dopo risposta)

Grok aggiorna `DECISIONI-DA-CHATGPT-VS-ROADMAP.md` (colonna Scelta) e risponde:

```
Ricevuto. Aggiornato: <elenco>. Procedo con implementazione.
```

---

## Privacy / repo

Non pubblicare chiavi API. Numero e email sono contatti operativi del progetto famiglia; se il repo diventa pubblico, spostare questo file fuori dal remote o redigere i numeri.
