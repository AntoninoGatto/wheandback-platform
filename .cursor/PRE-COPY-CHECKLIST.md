# PRE-COPY — prima di copiare wheback-platform sulla SSD

Data: ________   PC: ________

## A. Lavoro e git

- [ ] `git status` visto: lavoro untracked/modified presente (storefront, hooks, piano)
- [ ] Decisione: **(A)** commit+push ora  **oppure** **(B)** solo cartella SSD (scelgo: ____)
- [ ] Se A: pushato su `develop` **senza** `.env*` / dump
- [ ] Nessun secret nella chat o in file da committare

## B. Secret locali nella cartella

- [ ] Esiste `.env.local` (root)
- [ ] Esiste `apps/storefront-next/.env.local`
- [ ] Esiste `services/mercur-marketplace/packages/api/.env`
- [ ] (Opzionale) backup zip password-protected solo degli `.env*` su SSD

## C. Database Docker

- [ ] Docker Desktop avviato
- [ ] Eseguito `.\.cursor\transfer\dump-db.ps1`
- [ ] Esiste `.cursor/transfer/wheback_medusa.dump`

## D. Handoff Cursor

- [ ] Esiste `.cursor/HANDOFF.md`
- [ ] Esiste `.cursor/CHAT-EXPORT-2026-07-29.md`
- [ ] (Opzionale) copiate transcript in `.cursor/transcripts-raw/` con robocopy (vedi HANDOFF)

## E. Copia SSD

- [ ] Destinazione SSD pronta (es. `E:\wheback-platform`)
- [ ] Robocopy / copia cartella **inclusa** `.git` e `.env*`
- [ ] Esclusi (consigliato): `node_modules`, `.next`
- [ ] Verifica post-copia sulla SSD: aprendo la cartella vedi `.env.local`, `.cursor/HANDOFF.md`, dump se previsto

## F. Dopo la copia (ancora sul PC vecchio)

- [ ] Non cancellare il progetto vecchio finché il nuovo PC non ha smoke-test OK
