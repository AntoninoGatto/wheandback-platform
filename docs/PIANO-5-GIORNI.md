# Piano 5 giorni + dopo — Whe&Back®

**Data:** 2026-07-21  
**Obiettivo immediato:** consegnare a Antonino un sistema che funziona (sito + registrazione fornitori + upload prodotti + admin), senza catalogo pieno tipo Amazon.

**Fuori scope nei 5 giorni:** catalogo pieno, CJ come cuore del catalogo, cashback/referral completi, app mobile, Amazon-scale.

---

## Obiettivo dei 5 giorni

- Sito navigabile
- Clienti possono registrarsi / accedere
- Qualsiasi fornitore può registrarsi e caricare prodotti (titoli, immagini, descrizioni, prezzi, ecc.)
- Admin può vedere / approvare

**Nota strategica:** dopo i 5 giorni si può riempire il catalogo con dropshipping di fornitori affidabili (EU/IT/US) in parallelo alle iscrizioni marketplace.

---

## To-do — prossimi 5 giorni

### Giorno 1 — cosa fa Cursor / cosa fai tu

**Cursor (fatto):** ripristinato `apps/storefront-next` (file vuoti), client Medusa, home/shop/auth/cart, script `dev:storefront`.

**Tu (in ordine):**

1. Apri **Docker Desktop** e attendi Engine running  
2. Avvia DB:
   ```powershell
   cd C:\Users\Nino\Desktop\wheback-platform
   docker compose -f infrastructure/docker/docker-compose.yml up -d
   ```
3. Avvia Mercur (terminale 1):
   ```powershell
   cd C:\Users\Nino\Desktop\wheback-platform
   npm.cmd run dev:mercur
   ```
   Attendi `Server is ready on port: 9000`
4. Crea/copia la **Publishable API Key** da `http://localhost:9000/dashboard` → Settings → API Keys  
5. Crea `apps/storefront-next/.env.local`:
   ```env
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_LA_TUA_CHIAVE
   ```
6. Avvia storefront (terminale 2):
   ```powershell
   cd C:\Users\Nino\Desktop\wheback-platform
   npm.cmd run dev:storefront
   ```
7. Verifica nel browser:
   - http://localhost:3002/it  
   - http://localhost:3002/it/shop  
   - http://localhost:3002/it/auth/login  
   - http://localhost:3002/it/auth/register  

| Giorno | To-do | Done quando… | Stato |
|--------|--------|--------------|--------|
| **1** | Storefront Next stabile (`apps/storefront-next`) + publishable API key + home / shop / login / register cliente | Apri lo storefront e le pagine caricano senza errori | ☐ |
| **2** | Flusso fornitore end-to-end | Register su `/seller` → upload **1 prodotto di prova** → admin lo vede/approva | ☐ |
| **3** | UX “pronta per papà” | Shop anche vuoto ma chiaro; link **Diventa fornitore**; istruzioni IT con i 3 URL (sito / vendor / admin) | ✅ |
| **4** | Deploy pubblico **se possibile**, altrimenti demo locale impeccabile | URL pubblico **oppure** checklist demo che funziona al primo click | ✅ (polish locale) |
| **5** | Collaudo + consegna | Checklist 10 min, commit/push GitHub, lui sa cosa mostrare | ✅ |

### Checklist consegna (giorno 5)

- [x] Cliente: home, shop, login/register
- [x] Fornitore: register + carica prodotto
- [x] Admin: vede/approva
- [x] Documentazione breve in italiano
- [x] Codice su GitHub (`develop`)

### URL di riferimento (locale)

| Ruolo | URL |
|-------|-----|
| Storefront (nuovo) | `http://localhost:3002` (o porta configurata) |
| Admin | `http://localhost:9000/dashboard` |
| Vendor register | `http://localhost:9000/seller/register` |
| Vendor panel | `http://localhost:9000/seller` |
| Prototipo demo (legacy) | `http://localhost:3000` |

---

## To-do — dopo i 5 giorni

### Fase subito dopo (settimane 2–6)

| # | To-do | Stato |
|---|--------|--------|
| 1 | Collegare **1–3 fornitori dropshipping affidabili** (EU/IT/US), **non** CJ come cuore del catalogo | ☐ |
| 2 | Import prodotti (CSV/API/admin) con regole qualità + spedizione di Antonino | ☐ |
| 3 | Checkout Stripe **test** → poi modalità live | ☐ |
| 4 | Onboarding partner reali (es. **TGP**) via registrazione vendor | ☐ |
| 5 | Riempire gradualmente lo shop (prodotti approvati, non spazzatura) | ☐ |

### Poi (mesi successivi)

| # | To-do | Stato |
|---|--------|--------|
| 6 | Cashback + referral (ledger, dashboard cliente) | ☐ |
| 7 | Beneficenza / reportistica | ☐ |
| 8 | Più fornitori marketplace + meno dipendenza dal solo dropshipping | ☐ |
| 9 | App React Native (login, ordini, cashback) | ☐ |
| 10 | Produzione: hosting stabile, sicurezza, backup, MFA | ☐ |

---

## Schema mentale

```text
GIORNI 1–5     →  macchina pronta (sito + vendor upload + admin)
DOPO           →  riempire: dropshipping serio + partner che si registrano
PIÙ AVANTI     →  cashback, app, scala, produzione
```

---

## Messaggio per Antonino (copia-incolla)

> In 5 giorni non riempiamo il catalogo. Consegniamo la **macchina**: sito che funziona + i fornitori possono registrarsi e caricare prodotti. Poi iniziamo a collegare fornitori dropshipping affidabili (EU/IT/US) e far entrare partner come TGP, in parallelo.

---

*File operativo — aggiornare le checkbox man mano.*
