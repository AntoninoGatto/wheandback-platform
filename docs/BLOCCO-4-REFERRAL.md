# Blocco 4 — Referral e piani

Un solo livello. Il premio è credito WheBack, con lo stesso sblocco di 14 giorni del cashback e annullo se l'ordine viene rimborsato.

## Regole di default

- Fasce sul netto prodotti: A 35%, B 27%, C 21%.
- Premio solo sul primo ordine pagato di ogni persona invitata (`REFERRAL_REWARDED_ORDERS`, default 1).
- Tetto mensile per chi invita: `REFERRAL_MONTHLY_CAP_CENTS` (default 100000, cioè € 1.000).
- Auto-invito bloccato se coincidono cliente, email, impronta pagamento o indirizzo.
- Priorità regola: prodotto, poi vendor, poi categoria, poi default.
- Chi crea una bozza non può approvarla. Lo snapshot delle percentuali resta sull'ordine.

## API

- `GET /store/loyalty/plan` — piano attivo, cache invalidata quando un piano viene creato o approvato.
- `POST /store/loyalty/referral` — attribuzione, massimo 20 richieste al minuto per IP.
- `GET/POST /admin/loyalty/plans` e `PUT` per approvare.
- `GET /admin/loyalty/ledger`.

Admin Mercur: voce **Programma premi**.

## Pagine storefront

`/it/invita` con simulatore. Cookie `wb_ref` per 30 giorni se l'URL ha `?ref=`. Bozze legali in `/it/legale/*`, segnate BOZZA DA VALIDARE. Banner cookie. `sitemap.xml` e `robots.txt` usano `NEXT_PUBLIC_SITE_URL`.

Formulazione pubblica: «fino al 105% in credito WheBack». Non si scrive che qualcosa è gratis.
