# Dominio `wheback.com`: GoDaddy → Vercel (storefront)

**Cosa si sposta:** solo DNS / hosting del **sito pubblico** (storefront Next).  
**Cosa non si sposta:** registrazione dominio (può restare GoDaddy); backend Mercur API.

**Ordine:** Stripe test ok in locale → deploy storefront su Vercel → **poi** cambio DNS (evita dominio verso sito vuoto/rotto).

---

## Architettura DNS consigliata

| Host | Punta a | Note |
|------|---------|------|
| `wheback.com` / `www` | Progetto Vercel `storefront-next` | Frontend pubblico |
| `api.wheback.com` (dopo) | Host Mercur (Railway / Fly / VPS) | **Non** su Vercel tipicamente |

Storefront in produzione userà `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (o equivalente) verso `https://api.wheback.com`.

---

## Prerequisiti

- [ ] Account Vercel (Gabriele o Antonino)
- [ ] Repo GitHub collegato; root/app = `apps/storefront-next` (o monorepo settings Vercel)
- [ ] Build storefront ok in CI / preview
- [ ] Env Vercel: URL API pubblica, `NEXT_PUBLIC_STRIPE_PK` (test poi live)
- [ ] Accesso DNS GoDaddy (chi ha il login dominio)

---

## Passi Vercel

1. New Project → importa `wheback-platform`  
2. Root Directory: `apps/storefront-next`  
3. Framework: Next.js; build/start come da `package.json`  
4. Imposta env (senza commitare segreti)  
5. Deploy → verifica URL `*.vercel.app`  
6. Project → Settings → Domains → aggiungi `wheback.com` e `www.wheback.com`  
7. Vercel mostra i record DNS richiesti (`A` / `CNAME` oppure nameserver)

---

## Passi GoDaddy

**Opzione A — record sul DNS GoDaddy (consigliata per iniziare)**  
1. GoDaddy → Domini → `wheback.com` → DNS  
2. Imposta i record **esatti** indicati da Vercel (apex + www)  
3. Non cancellare il dominio; non trasferire registrar se non serve  
4. Attendi propagazione (minuti–ore)

**Opzione B — nameserver Vercel**  
Solo se Vercel lo richiede esplicitamente: cambio nameserver in GoDaddy verso quelli Vercel. Più invasivo; preferire A se funziona.

---

## Redirect www ↔ apex

In Vercel Domains: scegli un canonical (es. apex) e redirect automatico dell’altro.

---

## Dopo il cutover

- [ ] `https://wheback.com` apre lo storefront  
- [ ] HTTPS ok (cert Vercel)  
- [ ] Link API / checkout non puntano a `localhost`  
- [ ] Quando API è live: `api.wheback.com` con SSL sul provider API  

---

## Cosa non fare

- Cancellare il dominio da GoDaddy  
- Puntare DNS prima che il deploy Vercel sia verde  
- Mettere Mercur Admin/Vendor sullo stesso progetto Vercel dello storefront senza piano  
- Commitare chiavi Stripe live nel repo  

Vedi anche sintesi decisioni: [`DECISIONI-DA-CHATGPT-VS-ROADMAP.md`](./DECISIONI-DA-CHATGPT-VS-ROADMAP.md).
