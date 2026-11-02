# Grok Bot ↔ Whe&Back (non è “modello Grok in Cursor”)

**Grok Bot** = app Cursor/xAI separata: teammate con **computer cloud**, browser, terminal, memoria, email `@mail.grokbot.com`, lavora anche a PC spento.  
**Non** è: aprire Agent in Cursor IDE e scegliere il modello “Grok”.

Docs ufficiali: [Grok Bot](https://cursor.com/docs/grok-bot) · [Email del Bot](https://cursor.com/help/grok-bot/agent-email) · [Connect apps](https://cursor.com/help/grok-bot/connect-apps)

---

## Come collegarlo a questo progetto

Grok Bot **non indice** il codice come l’IDE. Per modificare `wheandback-platform` passa il lavoro a un **Cursor Cloud Agent** sul repo GitHub.

### 1) GitHub (obbligatorio)

1. Accedi a [cursor.com](https://cursor.com) con lo **stesso account** usato in Grok Bot  
2. **Dashboard → Integrations → GitHub → Connect**  
3. Autorizza il repo (o “Selected repositories”):  
   `AntoninoGatto/wheandback-platform`  
4. Serve un account GitHub con **write** su quel repo (oggi il push da `FelixGabry` dà 403 — usare Antonino o aggiungere collaboratore)

Opzionale in Grok Bot: connector GitHub (PAT) per lettura issues/PR/file senza Cloud Agent.

### 2) Crea il Bot “Whe&Back”

Nell’app **Grok Bot** (desktop o telefono):

1. Crea un Bot dedicato, es. nome **WheBack**  
2. Digli (primo messaggio):

```
Sei il teammate engineering di Whe&Back per 15 giorni.
Repo GitHub: AntoninoGatto/wheandback-platform (branch main).
Leggi e segui:
- docs/SPRINT-15-GIORNI-OPERATIVO.md
- docs/PROTOCOLLO-ESCALATION-ANTONINO.md
- docs/GROK-BOT-COLLEGAMENTO.md
Obiettivo: shop online + cashback MVP + referral 1 livello.
Per il codice: usa Cloud Agent sul repo, apri PR, non lasciare solo bozze chat.
Aggiorna docs/STATO-ATTUALE.md a ogni blocco.
```

3. Quando chiede accessi: approva GitHub / computer / app.

### 3) Email verso papà / progetto

**Due opzioni (si possono usare insieme):**

| Opzione | Cosa fa | Setup |
|---------|---------|--------|
| **A) Email del Bot** | Indirizzo `qualcosa@mail.grokbot.com` — riceve/invia come Bot | In chat: *“Get yourself an email address”* oppure Connect apps → Email |
| **B) Gmail collegato** | Usa la mailbox `info.buyallfree@gmail.com` | Connect apps → **Gmail** → autorizza quell’account |

Per scrivere a papà su `info.buyallfree@gmail.com`:
- con **B**: il Bot invia *da* info… (o legge/risponde lì)  
- con **A**: il Bot scrive *a* info… dal suo `@mail.grokbot.com`

Le email avviate da **routine** restano in **bozza** finché non premi Send (policy Grok Bot). Le email che **tu** chiedi in chat partono dopo Auto-review / approval.

Routine utile: *“Quando arriva mail da info.buyallfree@gmail.com o da Antonino, riassumi e continua lo sprint.”*

### 4) WhatsApp verso Antonino (+39 347 229 5125)

Non c’è un “collega WhatsApp personale” ufficiale come Gmail. Vie pratiche:

| Via | Note |
|-----|------|
| **WhatsApp Web** sul computer del Bot | QR una volta; sessione browser. Dopo refresh machine a volte va ri-linkato |
| **wacli** sul computer del Bot | Usato da altri utenti Grok Bot; salvare store in path che sopravvive al refresh (`WACLI_STORE_DIR` sotto `/workspace` o `~/.config`) |
| **Plugin WhatsApp Business** | Marketplace Cursor — account Business Meta, non il WA privato di papà |
| **Fallback** | Email a info… + Gabriele inoltra WA |

Prompt da dare al Bot dopo il primo link WA:

```
Quando serve conferma umana ad Antonino, manda WhatsApp a +39 3472295125
con formato PROTOCOLLO-ESCALATION-ANTONINO.md, e copia anche in email
a info.buyallfree@gmail.com. Max 2 WA/giorno salvo urgenza.
```

### 5) Altre app utili

- **1Password** (se usate vault) per login Vercel/Stripe sul browser del Bot  
- **Slack** solo se lo usate come team (oggi canale ufficiale = email + WA)

---

## Ruoli corretti (sprint)

| Chi | Ruolo |
|-----|--------|
| **Grok Bot (app)** | Teammate 24/7: codice via Cloud Agent, email, WA, stato |
| **Cursor IDE (questa chat)** | Backup locale, docs, sblocchi quando Gabriele è al PC |
| **Gabriele** | Approva carte Grok Bot, GitHub auth, click account, QR WhatsApp |
| **Antonino** | Risponde email/WA: OK DEFAULT / override regole |

---

## Checklist una tantum (Gabriele)

1. [ ] Installa / apri **Grok Bot** (stesso login Cursor Pro)  
2. [ ] Dashboard Cursor → GitHub → repo `wheandback-platform`  
3. [ ] Crea Bot **WheBack** + prompt sprint sopra  
4. [ ] Claim email Bot **oppure** Connect **Gmail** `info.buyallfree@gmail.com`  
5. [ ] Collega WhatsApp (Web o wacli) sul computer del Bot → test 1 messaggio a papà  
6. [ ] Manda ad Antonino il template di avvio in `PROTOCOLLO-ESCALATION-ANTONINO.md`  
7. [ ] Digli: *“Inizia lo sprint: primo blocco Stripe test + aggiorna STATO-ATTUALE”*

---

## Cosa non fare

- Non confondere “modello Grok in Agent Cursor” con Grok Bot  
- Non aspettarsi che Grok Bot veda file **solo locali** non pushati: push/commit sul GitHub connesso  
- Non mettere secret nel repo; usa Vault / 1Password / env sul computer del Bot  

Aggiornato: 2026-11-02
