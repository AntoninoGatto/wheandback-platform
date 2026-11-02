# Referral — solo dopo cashback

**Stato (sprint 15 gg nov 2026):** **SBLOCCATO in coda al cashback MVP** nello stesso sprint  
([`SPRINT-15-GIORNI-OPERATIVO.md`](./SPRINT-15-GIORNI-OPERATIVO.md)) — single-tier (B1=A).

**Stato (piano lungo):** BLOCCATO fino a step 5 ([`CASHBACK-DOPO-VENDITE.md`](./CASHBACK-DOPO-VENDITE.md)).

---

## Spec (quando sbloccato)

1. Codice / link referral univoco per cliente.  
2. Attribuzione primo ordine (cookie/param, anti-auto-referral).  
3. Premio: cashback extra o credito — **passa dal ledger cashback**.  
4. Limiti anti-abuso (cap giornaliero, self-referral ban).  
5. UI: `/[locale]/referral` su storefront Mercur.

## Definition of done

- [ ] Cashback live  
- [ ] Attribution + premio su ordine paid  
- [ ] Test abuso base  
