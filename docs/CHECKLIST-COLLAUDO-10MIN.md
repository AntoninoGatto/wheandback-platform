# Checklist collaudo 10 minuti — Giorno 5

**Usare:** collaudo consegna (più completo del primo-click).  
**Avvio stack:** `docs/AVVIO-DEMO.md`  
**Cosa mostrare:** `docs/COSA-MOSTRARE-DEMO.md`

Data: ________   Chi collauda: ________

---

## 0. Prerequisiti (2 min)

- [ ] Docker + `wheback-postgres` / `wheback-redis` up
- [ ] Mercur ready su `:9000`
- [ ] Storefront ready su `:3002`

---

## 1. Cliente — storefront (3 min)

- [ ] http://localhost:3002/it — home carica, brand Whe&Back®, CTA chiare
- [ ] http://localhost:3002/it/shop — shop ok (anche vuoto con messaggio + Diventa fornitore)
- [ ] http://localhost:3002/it/auth/login — form login visibile + header
- [ ] http://localhost:3002/it/auth/register — form registrazione visibile + header
- [ ] http://localhost:3002/it/istruzioni — 3 URL / bottoni (sito, vendor, admin)
- [ ] http://localhost:3002/it/cart — pagina carrello + header

**Esito cliente:** ☐ OK   ☐ Parziale   ☐ KO — note: _______________

> Smoke automatico 2026-08-01: home/shop/login/register/istruzioni/cart → HTTP 200.

---

## 2. Fornitore — vendor (3 min)

- [ ] http://localhost:9000/seller — pannello si apre
- [ ] http://localhost:9000/seller/register — registrazione fornitore raggiungibile
- [ ] (Se hai account) login vendor ok
- [ ] (Se possibile) carica **1 prodotto di prova**

**Esito fornitore:** ☐ OK   ☐ Parziale (solo UI, senza upload)   ☐ KO — note: _______________

> Smoke automatico 2026-08-01: `/seller` e `/seller/register` → HTTP 200. Upload prodotto e2e: da fare a mano se hai account.

---

## 3. Admin (2 min)

- [ ] http://localhost:9000/dashboard — pannello si apre
- [ ] (Se hai account admin) login ok
- [ ] (Se c’è un prodotto) lo vedi / puoi gestirlo

**Esito admin:** ☐ OK   ☐ Parziale (solo UI)   ☐ KO — note: _______________

> Smoke automatico 2026-08-01: `/dashboard` → HTTP 200. Login/gestione prodotto: da fare a mano se hai account.

---

## 4. Esito finale collaudo

| Area | Esito |
|------|--------|
| Cliente | ☐ OK ☐ Parziale ☐ KO |
| Fornitore | ☐ OK ☐ Parziale ☐ KO |
| Admin | ☐ OK ☐ Parziale ☐ KO |

- [ ] Collaudo **sufficiente per consegna demo locale**
- [ ] Collaudo **non sufficiente** — blocchi: _______________

**Non** usare `http://localhost:3000` come demo nuova (prototipo freeze).
