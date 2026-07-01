# DECISIONI TECNICHE — Whe&Back®

**Versione:** 1.0  
**Data:** 2026-06-24  
**Approvato da:** Antonino Gatti (direttiva tecnica ufficiale)  
**Implementazione:** Gabriele / team dev con Cursor Pro

---

## Decisione principale

**Whe&Back non è un sito e-commerce chiuso. È una piattaforma proprietaria scalabile.**

### Stack target (approvato)

| Layer | Tecnologia | Motivazione |
|-------|------------|-------------|
| Commerce backend | **Medusa.js** | Open source, moduli, workflow, API custom, ownership codice |
| Marketplace | **Mercur** (su Medusa) | Multi-vendor, vendor dashboard, commissioni, checkout multi-vendor |
| Storefront web | **Next.js** (App Router) | Performance, SSR, riuso componenti già costruiti |
| App mobile | **Flutter** o **React Native** | Da decidere: Flutter = multi-piattaforma; RN = ecosistema React |
| Database | **PostgreSQL** | Maturo, adatto a ordini/cashback/transazioni |
| Cache / code | **Redis** | Sessioni, cache, eventi real-time |
| Versionamento | **GitHub privato** | Proprietà codice, branch, review |
| Pagamenti marketplace (fase 2) | **Stripe Connect** o **Mangopay** | Split payment, payout fornitori |

### Stack attuale (prototipo — da migrare)

Next.js 16 + Supabase + Stripe (placeholder) + CJ API + OpenAI

**Stato:** conservare come riferimento in branch `legacy/prototype-supabase` dopo push Git. Non estendere con nuove feature.

---

## Piattaforme scartate (per fase attuale)

| Piattaforma | Decisione | Motivo |
|-------------|-----------|--------|
| Shopify | ❌ | Backend proprietario, cashback/referral complessi |
| WooCommerce | ❌ MVP only | Fragile con troppi plugin custom |
| BigCommerce | ❌ | SaaS esterno, non ownership completa |
| Magento / Adobe Commerce | ❌ | Troppo pesante per fase attuale |
| SiteGround Builder | ❌ | Non adatto a marketplace |
| Saleor | ⏸ Alternativa futura | Valido ma più specialistico di Medusa/Mercur |

---

## Struttura repository target

```
wheandback-platform/
  apps/
    storefront-next/      ← migrare UI da prototipo
    admin-panel/          ← admin Whe&Back custom + Mercur
    mobile-app/           ← Flutter o RN
  services/
    medusa-backend/       ← core commerce
    cashback-referral-service/
    supplier-import-service/  ← CJ, CSV, API fornitori
    ai-service/
    notification-service/
  packages/
    shared-types/
    ui-components/        ← componenti brand Whe&Back
    validators/
  infrastructure/
    docker/
    database/
    redis/
    monitoring/
  docs/
    ARCHITETTURA.md
    STATO-ATTUALE.md
    DECISIONI-TECNICHE.md
    ...
```

---

## Regole Cursor Pro (obbligatorie)

1. **Privacy Mode** attivo in Cursor
2. Mai segreti nei prompt (password, API key, token)
3. Solo `.env` locale + `.env.example` committato
4. Ogni modifica passa da Git
5. Funzioni critiche con test
6. Ogni modulo documentato
7. Scelte registrate in questo file
8. Nessuna libreria senza verifica licenza/manutenzione

---

## Sicurezza (riferimento OWASP)

- MFA admin e fornitori
- Ruoli: super admin, admin, fornitore, cliente, segnalatore, assistenza, contabilità
- Audit trail su cashback, referral, ordini, payout
- Rate limit API, validazione input, CSRF/XSS/IDOR
- Ambienti dev / staging / prod separati
- Backup automatici off-site

---

## Cashback e referral

- Cashback = **credito interno promozionale**, non wallet finanziario con prelievo libero
- Ogni movimento tramite `CashbackMovement` (pending → confirmed → cancelled → used)
- Referral: codice, link, QR, anti auto-referral, log completo
- Modulo separato, non plugin generico

---

## MVP Medusa (fase 1 post-migrazione)

1. Homepage + catalogo + scheda prodotto
2. Carrello + checkout + account cliente
3. Cashback base + referral base
4. Dashboard admin
5. Import CSV prodotti
6. Dashboard fornitore base
7. App mobile: login, saldo cashback, referral

**Dopo MVP:** dropshipping automatico, AI, marketplace avanzato, payout, commissioni auto.

---

## Stati prodotto (obbligatori)

`draft` → `pending_review` → `approved` / `rejected` → `active` → `paused` / `out_of_stock` → `archived`

---

## Piano migrazione dal prototipo

### Fase 0 — Ordine (IN CORSO)
- [x] Documentare stato attuale (`STATO-ATTUALE.md`)
- [x] Registrare decisioni (`DECISIONI-TECNICHE.md`)
- [ ] GitHub privato + Git installato
- [ ] Push codice prototipo
- [ ] Rotazione chiavi esposte

### Fase 1 — Setup Medusa/Mercur
- Monorepo scaffold
- Medusa + PostgreSQL + Redis in Docker
- Mercur marketplace plugin

### Fase 2 — Migrazione storefront
- Portare componenti UI e i18n
- Collegare API Medusa al posto di Supabase

### Fase 3 — Moduli custom
- cashback-referral-service
- supplier-import-service (CJ + CSV)
- ai-service

### Fase 4 — App mobile
- API stabili → Flutter o RN

---

## Decisioni aperte (da confermare con Antonino Gatti)

| # | Domanda | Opzioni |
|---|---------|---------|
| 1 | App mobile | Flutter vs React Native |
| 2 | Hosting produzione | Vercel + Railway? AWS? |
| 3 | Email transazionali | Resend vs SendGrid |
| 4 | Dominio inviti partner | wheback.com vs localhost dev |
| 5 | Nome repo GitHub | `wheandback-platform` vs `wheback-platform` |
| 6 | Intestatario repo | Buy All Free LTD / Antonino Gatti |

---

*Ogni nuova decisione va aggiunta in fondo con data e motivazione.*
