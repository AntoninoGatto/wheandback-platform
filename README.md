# Whe&Back® Platform

Piattaforma e-commerce etica con marketplace, cashback, referral, fornitori e dropshipping.

**Proprietà:** Buy All Free LTD — visione Antonino Gatti  
**Stato:** prototipo Next.js + Supabase → migrazione verso **Medusa.js + Mercur + Next.js**

---

## Documentazione ufficiale

| Documento | Descrizione |
|-----------|-------------|
| [docs/STATO-ATTUALE.md](docs/STATO-ATTUALE.md) | Cosa esiste oggi nel prototipo |
| [docs/DECISIONI-TECNICHE.md](docs/DECISIONI-TECNICHE.md) | Direttiva tecnica e stack target |
| [docs/ARCHITETTURA.md](docs/ARCHITETTURA.md) | Architettura target modulare |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Fasi di implementazione |
| [wheback.prd.md](wheback.prd.md) | Product Requirement Document |

---

## Stack attuale (prototipo)

- Next.js 16, React 19, Tailwind CSS 4
- Supabase (Auth + PostgreSQL)
- Stripe (placeholder), CJ Dropshipping, OpenAI
- next-intl (IT, EN, FR, ES, DE)

---

## Avvio locale

```powershell
cd wheback-platform
copy .env.example .env.local
# Compila .env.local con le chiavi reali
npm.cmd install
npm.cmd run dev
```

Apri http://localhost:3000

> Su Windows PowerShell usare `npm.cmd` se compare errore Execution Policy.

---

## Regole di sviluppo

1. **Non committare** `.env.local`
2. **Non aggiungere feature** finché Fase 0 (Git + documentazione) non è approvata
3. Usare **Privacy Mode** in Cursor
4. Mai incollare segreti in chat

---

## Prossimo passo

Creare repository **GitHub privato** e pushare questo codice. Vedi `docs/ROADMAP.md` Fase 0.
