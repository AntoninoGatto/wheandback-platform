# ROADMAP — Whe&Back®

## Fase 0 — Ordine e proprietà codice ✅ COMPLETATA

- [x] Prototipo funzionante (Next.js + Supabase)
- [x] Documentazione stato attuale
- [x] Decisioni tecniche registrate
- [x] Git installato
- [x] Repository GitHub privato (`AntoninoGatto/wheandback-platform`)
- [x] Codice pushato (`main` + `develop`)
- [x] Rotazione chiavi API (Step 6)
- [x] Approvazione Antonino Gatti + React Native

**Prototipo:** freeze feature — solo demo e bugfix critici.

---

## Fase 1 — Foundation Medusa/Mercur ✅ COMPLETATA

Vedi guida dettagliata: [`docs/FASE-1-GUIDA.md`](FASE-1-GUIDA.md)

- [x] Installare Docker Desktop
- [x] Avviare PostgreSQL + Redis (`infrastructure/docker/docker-compose.yml`)
- [x] Creare backend Mercur (`services/mercur-marketplace`)
- [x] Verificare admin + vendor panel in locale (porta 9000)
- [x] Script `build:panels` + documentazione avvio
- [x] Commit + push su branch `develop`

**Prossimo:** Fase 2 — attendere OK Antonino.

---

## Fase 2 — MVP commerce

- Storefront Next.js (UI migrata da prototipo)
- Catalogo, carrello, checkout
- Stripe pagamenti test
- Account cliente

---

## Fase 3 — Marketplace & fornitori

- Vendor dashboard (Mercur)
- Onboarding partner (flusso TGP)
- Approvazione prodotti
- Import CSV + CJ service

---

## Fase 4 — Cashback & Referral

- Modulo ledger movimenti
- Dashboard cliente cashback/referral
- Regole business da PRD

---

## Fase 5 — App mobile (React Native + Expo)

- Login, cashback, referral, ordini
- Push notifications

---

## Fase 6 — Scale & compliance

- Stripe Connect / Mangopay
- MFA, audit log, OWASP hardening
- Staging/prod, monitoring, backup off-site
- AI modules avanzati

---

*Aggiornare le checkbox ad ogni sprint.*
