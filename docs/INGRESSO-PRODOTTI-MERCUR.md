# Ingresso prodotti in Mercur / shop — Whe&Back®

**Stack:** Mercur API `:9000` + storefront `:3002`  
**Hook già presente:** [`product-store-visibility.ts`](../services/mercur-marketplace/packages/api/src/workflows/hooks/product-store-visibility.ts)  
(auto-link `product_seller` + sales channel → prodotto visibile su `/store/products`).

---

## Percorsi ammessi (in ordine di semplicità)

### A) Vendor manuale (primo lotto / partner)

1. Fornitore o operatore: `http://localhost:9000/seller` (auth **member**).  
2. `POST /vendor/products` (o UI vendor) → status tipico `proposed`.  
3. Admin: `http://localhost:9000/dashboard` → confirm prodotto → `published`.  
4. Hook visibility collega seller + sales channel.  
5. Verifica: `http://localhost:3002/it/shop`.

**Ideale per:** TGP / partner, 1–20 SKU, collaudo qualità umana.

### B) CSV filtrato → Mercur (dropshipping)

1. Scaricare CSV fornitore.  
2. Applicare [`REGOLE-QUALITA-IMPORT.md`](./REGOLE-QUALITA-IMPORT.md) (script o review).  
3. Importare solo righe PASS (fase 1: creazione prodotto via vendor/admin API o script `medusa exec`).  
4. Prodotti restano `proposed` finché admin non conferma.  
5. Solo dopo confirm → shop.

**Ideale per:** 20–200 SKU dopo shortlist fornitori.

### C) API fornitore (dopo)

Solo quando il fornitore #1 è stabile: job periodico stock/prezzo.  
**Non** partire da qui.

---

## Diagramma

```text
Fornitore DS / Partner
        │
        ▼
  Filtri qualità ──FAIL──► scarta
        │ PASS
        ▼
  Mercur product (proposed)
        │
        ▼
  Admin confirm (published)
        │
        ▼
  Hook store visibility
        │
        ▼
  Storefront /it/shop
```

---

## Ruoli

| Chi | Cosa fa |
|-----|---------|
| Antonino / ops | Sceglie fornitori, conferma regole ship/margine |
| Vendor partner | Carica prodotti path A |
| Admin | Approva seller + confirm prodotti |
| Dev | Script CSV / Stripe / automazioni — dopo path A stabile |

---

## Definition of done (catalogo “serio” minimo)

- [ ] ≥ 1 fornitore shortlist validato **oppure** 1 partner vendor attivo  
- [ ] ≥ 10 prodotti `published` che passano le regole qualità  
- [ ] Visibili su `/it/shop`  
- [ ] Nessun CJ come sorgente primaria  

Poi si passa a Stripe test ([`STRIPE-CHECKOUT.md`](./STRIPE-CHECKOUT.md)).
