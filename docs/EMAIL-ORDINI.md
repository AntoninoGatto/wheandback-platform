# Email conferma ordine — Step 5

**Stack:** Mercur API (`packages/api`)  
**Subscriber:** `src/subscribers/order-placed-email.ts` (evento `order.placed`)

---

## Cosa fa

Alla creazione di un ordine:

1. Email al **cliente** (campo `email` del carrello/ordine)  
2. Opzionale: copia a **ops** se `ORDER_NOTIFY_EMAIL` è valorizzata  
3. Notifica **feed** Admin (campanella)  
4. Anteprima HTML sempre in `packages/api/.medusa/emails/order-*.html`

---

## Locale (default, senza account email)

1. Nessuna `SENDGRID_API_KEY` → provider **local** sul canale `email`  
2. Riavvia `dev:mercur` dopo aver aggiornato `medusa-config.ts`  
3. Completa un checkout di prova con email reale nel form  
4. Controlla:
   - log terminale Mercur (`order-placed-email: queued email…`)  
   - file in `services/mercur-marketplace/packages/api/.medusa/emails/`

**Checkpoint Step 5 in locale:** file HTML di conferma generato + log OK.

---

## Produzione / inbox vera (SendGrid)

In `packages/api/.env`:

```env
SENDGRID_API_KEY=SG....
SENDGRID_FROM=noreply@wheback.com
ORDER_NOTIFY_EMAIL=tuo@wheback.com
```

Riavvia Mercur. Solo un provider per canale `email`: con API key usa SendGrid al posto del local.

Alternative future (stesso pattern): Resend / SMTP — da aggiungere come provider se preferisci.

---

## Test rapido

1. Shop → carrello → checkout con email tua  
2. Paga `4242…`  
3. Apri `.medusa/emails/order-….html` nel browser  
4. (Con SendGrid) controlla inbox + spam  

Poi: Step 6 hosting API.
