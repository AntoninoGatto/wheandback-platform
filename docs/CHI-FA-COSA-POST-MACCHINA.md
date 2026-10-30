# Chi fa cosa — post-macchina (ordine rischio basso)

**Aggiornato:** 2026-09-28  
**Regola:** catalogo/fornitori → Stripe → vendite vere → **poi** cashback → referral → app.  
**Dominio:** deploy Vercel storefront → poi DNS `wheback.com` (`DOMINIO-GODADDY-VERCEL.md`).

---

## Già fatto (Cursor / codice)

| Cosa | Dove |
|------|------|
| Macchina demo (sito + vendor + admin) | `:3002` + `:9000` |
| Shortlist criteri fornitori | `docs/FORNITORI-SHORTLIST.md` |
| Regole qualità import | `docs/REGOLE-QUALITA-IMPORT.md` |
| Come i prodotti entrano in Mercur/shop | `docs/INGRESSO-PRODOTTI-MERCUR.md` |
| Wiring Stripe + pagina checkout (auto payment session) | `medusa-config.ts`, `/it/checkout`, `docs/STRIPE-CHECKOUT.md` |
| Checklist vendite / spec cashback / referral / app (bloccate) | docs omonimi |
| Decisioni ChatGPT → scelte firmabili papà | `docs/DECISIONI-DA-CHATGPT-VS-ROADMAP.md` |
| Guida dominio GoDaddy → Vercel | `docs/DOMINIO-GODADDY-VERCEL.md` |

---

## Cosa fa **Gabriele** (tu)

1. **Accendere lo stack** quando serve (Docker + `dev:mercur` + `dev:storefront`) — guida: `docs/AVVIO-DEMO.md`.  
2. **Aprire account Stripe** (o usare quello di Antonino) e mettere **solo chiavi TEST**:
   - API: `STRIPE_API_KEY=sk_test_…` in `services/mercur-marketplace/packages/api/.env`
   - Storefront: `NEXT_PUBLIC_STRIPE_PK=pk_test_…` in `apps/storefront-next/.env.local`
   - Riavviare Mercur + storefront  
3. In Admin (`:9000/dashboard`): **Regions → abilita Stripe**.  
4. Provare checkout test su `:3002/it/checkout` (carta `4242…`).  
5. **Non** partire con cashback/referral/app finché non ci sono vendite.  
6. (Quando stabile) commit/push del lavoro docs+Stripe **senza** `.env*` — chiedi conferma in chat prima.  
7. Dopo Stripe test: deploy storefront su Vercel + DNS (`DOMINIO-GODADDY-VERCEL.md`).

---

## Cosa fa **Papà / Antonino** (business)

1. **Scegliere categorie** del primo catalogo (max 2–3).  
2. **Compilare la tabella 1–3 fornitori** in `docs/FORNITORI-SHORTLIST.md` (o dirti i nomi da scrivere).  
3. Decidere **margine minimo** e **tempi spedizione IT** accettabili (`REGOLE-QUALITA-IMPORT.md`).  
4. Firmare scelte A/B in `DECISIONI-DA-CHATGPT-VS-ROADMAP.md` (cashback solo credito? referral 1 livello o multi?).  
5. Se c’è **TGP** (o altro partner): loro si registrano su `/seller`, lui approva in Admin.  
6. Validare **5–10 prodotti** “sì / no” con le regole qualità (anche a voce).  
7. Dopo Stripe test ok: autorizzare passaggio a **live** e le **prime vendite vere**.  
8. Solo dopo vendite vere: dire “ok cashback”, poi “ok referral”, app per ultima.  
9. Se ha login GoDaddy: collaborare al cutover DNS quando il deploy Vercel è verde.

---

## Cosa fa di nuovo **Cursor** (quando glielo chiedi)

| Fase | Cursor può… |
|------|-------------|
| Ora | Docs, checkout senza chiavi; con chiavi → debug pagamento test |
| Dopo fornitori scelti | Aiutare import SKU filtrati in Mercur |
| Dopo chiavi Stripe | Debug pagamento test end-to-end |
| Dopo deploy ok | Assistenza DNS GoDaddy → Vercel (click da guida) |
| Dopo vendite vere | Implementare cashback (ledger + UI) |
| Dopo cashback | Referral |
| Alla fine | App React Native |

---

## Prossimo passo concreto (questa settimana)

1. **Papà:** categorie + 1 fornitore candidato (anche solo il nome).  
2. **Tu:** chiavi Stripe **test** + Region.  
3. **Insieme:** 5 prodotti in shop che passano le regole.  
4. **Tu + Cursor:** un pagamento test riuscito.

Poi si parla di vendite vere — non prima.
