# Cashback — solo dopo vendite vere

**Stato:** BLOCCATO fino a step 4 ([`CHECKLIST-PRIME-VENDITE.md`](./CHECKLIST-PRIME-VENDITE.md)).  
**Non implementare** ledger/UI finché non esistono ordini pagati reali.

---

## Perché dopo le vendite

Senza pagamenti e ordini, il cashback è fantasia contabile.  
Con vendite vere si sa: quando matura, su quale base (netto/lordo), eccezioni resi.

---

## Spec da implementare (quando sbloccato)

1. **Evento trigger:** ordine `captured` / paid (Mercur/Medusa).  
2. **Ledger:** movimento + saldo cliente (non solo campo UI).  
3. **Regole:** % o fisso; delay sblocco (es. dopo spedizione / 14 gg); annullo su refund.  
4. **UI:** pagina `/[locale]/cashback` sullo storefront Mercur (non prototipo `:3000`).  
5. **Admin:** report movimenti + correzione manuale.

## Fuori scope in questa fase

- Referral (step 6)  
- App mobile  
- Portare il codice cashback del prototipo `:3000` senza riscrivere su Mercur  

## Definition of done

- [ ] Step 4 chiuso  
- [ ] Ledger su DB Mercur/custom module  
- [ ] UI cliente + test refund  
