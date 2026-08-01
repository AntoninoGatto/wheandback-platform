# Cosa mostrare in demo — Whe&Back®

**Per:** Antonino / papà / chi presenta  
**Durata:** ~2–3 minuti  
**Stack:** solo storefront `:3002` + Mercur `:9000`  
**Non aprire:** `http://localhost:3000` (prototipo vecchio, freeze)

Prima di iniziare: `docs/AVVIO-DEMO.md` + `docs/CHECKLIST-PRIMO-CLICK.md`

---

## Parte da qui

**http://localhost:3002/it/istruzioni**

Qui ci sono i **3 collegamenti** grandi:

1. **Sito** (clienti) → `localhost:3002`
2. **Fornitori** → `localhost:9000/seller`
3. **Admin** → `localhost:9000/dashboard`

---

## Ordine consigliato (parla poco, clicca)

### 1) Sito / clienti
- Home: http://localhost:3002/it  
- Shop: http://localhost:3002/it/shop *(anche vuoto: si vede il messaggio + “Diventa fornitore”)*  
- Opzionale: Login / Registrati cliente

**Frase:** *“Questa è la vetrina: i clienti entrano da qui.”*

### 2) Fornitori
- Area vendor: http://localhost:9000/seller  
- Registrazione: http://localhost:9000/seller/register  
- Se puoi: mostra dove si carica un prodotto

**Frase:** *“I fornitori si iscrivono qui e caricano i loro articoli.”*

### 3) Admin
- http://localhost:9000/dashboard  

**Frase:** *“Da qui si controlla il marketplace.”*

### 4) Torna allo Shop
Ricarica http://localhost:3002/it/shop  
*(Se c’è un prodotto pubblicato, lo si vede in vetrina.)*

---

## Cosa NON dire / non fare

- Non presentare il sito su porta **3000** come “il nuovo”
- Non promettere catalogo pieno tipo Amazon (fuori scope dei 5 giorni)
- Non mostrare file `.env` o password in chat/schermo

---

## Messaggio di chiusura (copia-incolla)

> In questi giorni abbiamo messo in piedi la **macchina**: sito che funziona, fornitori che possono registrarsi e caricare prodotti, admin per controllare. Il catalogo si riempie dopo, con fornitori affidabili e partner reali.

---

## Link utili

| Doc | Uso |
|-----|-----|
| `docs/AVVIO-DEMO.md` | Accendere Docker + Mercur + storefront |
| `docs/CHECKLIST-PRIMO-CLICK.md` | Prima di chiamare |
| `docs/CHECKLIST-COLLAUDO-10MIN.md` | Collaudo consegna |
| `docs/TO-DO-LIST-progetto-wheback.md` | Cosa resta dopo i 5 giorni |
