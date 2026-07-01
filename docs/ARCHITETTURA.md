# ARCHITETTURA — Whe&Back® (target)

**Stato:** progettazione approvata — implementazione non iniziata  
**Prototipo attuale:** monolite Next.js + Supabase (vedi `STATO-ATTUALE.md`)

---

## Visione

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTI                               │
│   Browser (Next.js)  │  App mobile  │  Admin / Vendor UI    │
└──────────┬───────────┴──────┬───────┴──────────┬────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY / BFF                        │
│              (Next.js route handlers o API dedicata)         │
└──────────┬──────────────────────────────────────────────────┘
           │
     ┌─────┴─────┬─────────────┬──────────────┬──────────────┐
     ▼           ▼             ▼              ▼              ▼
┌─────────┐ ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐
│ Medusa  │ │ Cashback│ │ Supplier  │ │    AI    │ │ Notify   │
│ + Mercur│ │ Referral│ │ Import    │ │ Service  │ │ Service  │
└────┬────┘ └────┬────┘ └─────┬─────┘ └────┬─────┘ └────┬─────┘
     │           │            │            │            │
     └───────────┴────────────┴────────────┴────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              PostgreSQL              Redis
```

---

## Moduli

### Medusa + Mercur (core)
- Prodotti, varianti, prezzi, inventory
- Ordini, pagamenti, spedizioni
- Customer accounts
- Vendor accounts (Mercur)
- Commissioni marketplace

### cashback-referral-service
- Ledger movimenti cashback
- Codici e conversioni referral
- Regole anti-abuso
- Report admin

### supplier-import-service
- CJ Dropshipping API (logica già in prototipo)
- CSV/XLSX import
- Sync stock/prezzi
- Regole margine e blacklist (da `catalog-rules.ts`)

### ai-service
- Descrizioni prodotto (OpenAI — già prototipato)
- Traduzione ricerche
- Futuro: raccomandazioni, moderazione

### notification-service
- Email inviti partner
- Push app
- Alert ordini

---

## Modello dati target (entità principali)

Vedi direttiva: Customer, Supplier, Product, SupplierProductOffer, Order, OrderItem, CashbackAccount, CashbackMovement, ReferralCode, ReferralClick, ReferralConversion, CommissionRule, Campaign, Payout, ReturnRequest, AuditLog, Notification.

Il prototipo Supabase copre parzialmente: profiles, products, orders, cashback_transactions, referral_*, seller_profiles, seller_invitations.

---

## Ambienti

| Ambiente | Uso |
|----------|-----|
| `development` | PC locale + Docker |
| `staging` | Test pre-produzione |
| `production` | wheback.com |

Mai testare migration o pagamenti direttamente in produzione.

---

## Cosa recuperare dal prototipo

| Asset | Destinazione |
|-------|--------------|
| Componenti React brand | `packages/ui-components` |
| `messages/*.json` | `apps/storefront-next` |
| `constants/*.ts` | `packages/validators` + docs business |
| `lib/dropshipping/*` | `services/supplier-import-service` |
| `lib/seller/*` | Mercur vendor flows + custom API |
| Migration SQL Supabase | Riferimento per schema Medusa, non import diretto |

---

*Documento da espandere in Fase 1 setup Medusa.*
