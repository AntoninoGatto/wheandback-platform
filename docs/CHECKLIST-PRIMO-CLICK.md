# Checklist primo-click — demo Whe&Back®

**Usare:** prima di far vedere la demo a papà / Antonino.  
**Guida comandi:** `docs/AVVIO-DEMO.md`

Data: ________   Chi avvia: ________

---

## A. Motore acceso

- [ ] Docker Desktop aperto → Engine **running**
- [ ] Eseguito: `docker compose -f infrastructure/docker/docker-compose.yml up -d`
- [ ] `docker ps` mostra `wheback-postgres` e `wheback-redis` (healthy / Up)
- [ ] Terminale 1: `npm.cmd run dev:mercur` → compare `Server is ready on port: 9000`
- [ ] Terminale 2: `npm.cmd run dev:storefront` → ready su porta **3002**

---

## B. Pagine che devono aprirsi (nessun errore rosso)

- [ ] http://localhost:3002/it/istruzioni
- [ ] http://localhost:3002/it
- [ ] http://localhost:3002/it/shop *(anche vuoto: messaggio chiaro + Diventa fornitore)*
- [ ] http://localhost:9000/seller
- [ ] http://localhost:9000/dashboard

---

## C. Cosa mostrare in 2 minuti (ordine)

1. [ ] **Istruzioni** — i 3 bottoni (sito / fornitori / admin)
2. [ ] **Shop** — vetrina (vuota ok)
3. [ ] **Diventa fornitore** / area seller — dove si caricano i prodotti
4. [ ] **Admin** — dove si controlla il marketplace

---

## D. Se qualcosa fallisce (stop e ripara)

- [ ] Mercur / DB → vedi tabella “Se qualcosa non parte” in `AVVIO-DEMO.md` (porta Postgres **5433**)
- [ ] Shop non carica → Mercur è ready? Esiste lo `.env.local` dello storefront?
- [ ] Seller/Dashboard vuoti → `npm.cmd run build:mercur-panels`

**Non** aprire il prototipo `:3000` come demo nuova.

---

## Esito

- [ ] Demo pronta — si può chiamare
- [ ] Non pronta — motivo: _______________________________
