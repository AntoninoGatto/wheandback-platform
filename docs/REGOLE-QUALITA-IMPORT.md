# Regole qualità import prodotti — Whe&Back®

**Scopo:** filtrare spazzatura prima che entri in Mercur / shop.  
**Usa con:** [`FORNITORI-SHORTLIST.md`](./FORNITORI-SHORTLIST.md) + [`INGRESSO-PRODOTTI-MERCUR.md`](./INGRESSO-PRODOTTI-MERCUR.md).

---

## Regole bloccanti (must pass)

1. **Titolo** — italiano (o traducibile), non solo SKU/codice; max ~120 caratteri; niente ALL CAPS spam.  
2. **Descrizione** — almeno 2–3 frasi utili (materiali, uso, dimensioni se rilevanti).  
3. **Immagini** — ≥ 1 URL immagine raggiungibile; preferibile sfondo chiaro / prodotto visibile; no watermark enormi.  
4. **Prezzo** — prezzo vendita > costo + spedizione stimata + margine minimo (soglia Antonino).  
5. **Categoria** — allineata alle categorie ammesse (da definire); vietato: adult, armi, pharma non autorizzata, contraffazioni.  
6. **Stock** — stock > 0 o lead time dichiarato.  
7. **Spedizione** — ETA IT dichiarato ≤ soglia (default proposta: 10 giorni lavorativi se EU warehouse; altrimenti da approvare caso per caso).  
8. **Peso/dimensioni** — presenti se influiscono sul ship cost (altrimenti stima conservativa).

---

## Regole soft (warning, review umana)

- Brand sconosciuto senza recensioni  
- Varianti eccessive (> 20) al primo import  
- Prezzo sospettosamente basso vs competitor  
- Solo foto lifestyle senza dettaglio prodotto  

---

## Flusso decisione

```text
CSV/API riga
   → regole bloccanti
      → FAIL → scarta / quarantena
      → PASS → proposed in Mercur
         → admin confirm
            → shop (hook product-store-visibility)
```

---

## Campi CSV minimi consigliati

| Campo | Obbligatorio |
|-------|----------------|
| `sku` | sì |
| `title` | sì |
| `description` | sì |
| `price_cost` | sì |
| `price_sell` | sì (o calcolato) |
| `currency` | sì (`eur`) |
| `image_url` | sì |
| `stock` | sì |
| `weight_grams` | consigliato |
| `ship_eta_days_it` | sì |
| `category` | sì |
| `supplier_code` | sì |

---

## Spedizione di Antonino (da compilare)

| Zona | Costo base | ETA | Note |
|------|------------|-----|------|
| Italia | _TBD_ | _TBD_ | |
| UE | _TBD_ | _TBD_ | |
| Extra-UE | _TBD_ | _TBD_ | |

Finché non compilato: **non** pubblicare SKU con ship ignoto.
