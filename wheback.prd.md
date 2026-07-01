Questo documento è stato blindato integrando le regole di sviluppo visivo con le stringenti specifiche legali e di backend estratte dai documenti ufficiali.

# **📋 PRODUCT REQUIREMENT DOCUMENT (PRD) — PROJECT: WHE\&BACK**

**Riferimento di progetto per Cursor & Claude**  
**Proprietà Intellettuale:** Antonino Gatto **Società Licenziataria:** Buy All Free LTD (Company Number: 13803002\) **Istruzione Mandatoria per l'IA:** Considerare questo documento come l'unica e assoluta fonte di verità per la logica di business, lo stile visivo e i vincoli legali del sistema.

## **SEZIONE 1: IDENTITÀ, GRAFICA E FONDAMENTA (FRONTEND)**

### **1.1 Linee Guida di Brand & Interfaccia**

Questo capitolo definisce i vincoli visivi e d'immagine immutabili della piattaforma.

* **Font Ufficiale:** Il font di sistema per l'intera interfaccia (titoli, testi, menu e pulsanti) deve essere tassativamente **Montserrat**.  
* **Palette Colori Istituzionale:** L'applicazione di stili (CSS/Tailwind) deve rispettare rigorosamente i codici esadecimali del logo:  
  * **Verde Niagara (**\#00b295**):** Utilizzato esclusivamente per la "e commerciale" (&) e per mirati elementi di richiamo visivo.  
  * **Blu Cello (**\#253866**):** Utilizzato per la scritta principale "whe back", per il simbolo del boomerang posizionato sopra la & e come colore predominante dei testi o degli sfondi scuri dell'interfaccia.  
* **Utilizzo Coerente del Marchio:** L'interfaccia deve presentare il logo nella sua combinazione grafica ufficiale: la scritta "whe back" e il boomerang sovrastante in Blu Cello, intermezzati dalla & in Verde Niagara.  
* **Obbligo Legale del Simbolo ®:** Ogni singola volta che all'interno del sito (nelle pagine, nei banner o nei testi descrittivi) viene utilizzato il logo o viene scritta la parola riferita al logo (*whe\&back*), questa deve essere obbligatoriamente accompagnata dal simbolo di marchio registrato **®**.  
* **Integrità del Brand:** Non è ammessa alcuna modifica o alterazione autonoma della grafica del logo o della palette durante lo sviluppo. Ogni contenuto visivo deve rispettare il prestigio, il decoro e la fama del Licenziante (Antonino Gatto).

### **1.2 Sistema Multilingua**

La piattaforma nasce con una vocazione internazionale e deve scalare nativamente per supportare utenti ed esercenti in tutto il mondo.

* **Lingue Supportate:** Il sistema di routing e internazionalizzazione (i18n) deve prevedere la localizzazione completa in **5 lingue**:  
  1. Italiano  
  2. Inglese  
  3. Francese  
  4. Spagnolo  
  5. Tedesco  
* **Gestione Tecnica:** Il frontend (Next.js) deve implementare una struttura di traduzione flessibile, capace di gestire file di traduzione locali (es. JSON) per i testi statici dell'interfaccia, e campi multilingua nel database per i prodotti caricati autonomamente dai commercianti.  
* **Conformità Comunicativa:** Qualsiasi traduzione automatica o manuale, testo pubblicato o comunicazione generata nelle diverse lingue deve rispettare rigorosamente le normative vigenti in materia di promozioni e trasparenza; nessun termine in contrasto con le leggi locali può essere inserito.


### **1.3 Struttura delle Pagine Chiave (Mappatura Frontend)**

L'interfaccia generale deve essere accattivante ed etica, limitando l'accesso ai minori non accompagnati dai genitori.

#### **1\. Homepage**

* **Hero Section:** Primo impatto visivo focalizzato sullo slogan: *"Aiutami a Cambiare il Mondo, Compra e Vendi anche Tu\!"*.  
* **Sezione "Come Funziona":** Spiegazione immediata del ciclo etico basato sul secondo slogan: *"La vita è un cerchio, Fai un acquisto con Whe\&Back e tutto torna"*.  
* **Valori del Progetto:** Focus sul modello etico e sulla sostenibilità del sistema.  
* **Prodotti in Evidenza:** Griglia di e-commerce con articoli selezionati.  
* **Sezioni Dedicate (Cashback & Referral):** Banner esplicativi con invito all'azione (CTA).  
* **Impatto Sociale & Beneficenza:** Contatore o spazio informativo trasparente che mostra il funzionamento della devoluzione dell'1% del fatturato.  
* **Produttori Partner & Testimonianze:** Carosello dei loghi degli esercenti convenzionati e recensioni.  
* **Footer:** Note legali complete, dati societari di *Buy All Free LTD* , link alla privacy policy (collaborazione Iubenda) e registro di trasparenza.

#### **2\. Shop (E-commerce & Marketplace)**

* **Catalogo prodotti:** Diviso per le categorie merceologiche approvate inizialmente (Largo consumo, Oggettistica, Cani e gatti, Minuteria elettrica/elettronica, Casa, Hobby).  
* **Filtri e Restrizioni:** Esclusione totale dei prodotti vietati (monopattini, accendini, prodotti che creano dipendenza o eticamente scorretti).  
* **Scheda Prodotto:** Visualizzazione chiara del prezzo, delle specifiche e della percentuale esatta di **Cashback generato** dall'acquisto (variabile dal 5% al 35%).

#### **3\. Pagina Cashback**

* **Spiegazione Didattica:** Chiarimento delle regole di accredito (il cashback si attiva solo dopo la consegna avvenuta e la scadenza o rinuncia del diritto di recesso).  
* **Vincolo d'Uso:** Testo trasparente che specifica che il saldo visualizzato è utilizzabile solo come credito interno per nuovi acquisti e non è mai prelevabile in denaro.

#### **4\. Pagina Referral**

* **Sezione Promozionale:** Focus sullo slogan: *"Vuoi fare un regalo a qualcuno? Usa il suo link Referral"*.  
* **Meccanica:** Spiegazione del sistema a inviti illimitati e dei livelli di premio multilivello. Generazione immediata del link di invito personale per l'utente loggato.

#### **5\. Pagina Beneficenza**

* **Trasparenza Totale:** Dettagli sulla donazione mensile dell'1% del fatturato a favore dell'associazione *"Il Segreto di Aladino"*.  
* **Reportistica:** Sezione di download o visualizzazione dei report mensili e della documentazione ufficiale a riprova dei bonifici effettuati.

#### **6\. Pagine Informative e di Servizio**

* **Produttori (B2B):** Pagina di atterraggio per commercianti ed esercenti che vogliono candidarsi, con modulo per accettare le condizioni di convenzionamento per caricare i propri prodotti.  
* **Chi Siamo:** Storia di Whe\&Back come marchio commerciale gestito da *Buy All Free LTD* (attiva da oltre 4 anni) sotto la visione etica del titolare Antonino Gatto.  
* **FAQ (Domande Frequenti):** Risposte immediate su spedizioni, resi, calcolo del cashback e funzionamento del referral.  
* **Blog:** Articoli di approfondimento su commercio etico, aggiornamenti sulle donazioni e novità del marketplace.  
* **Contatti:** Form di supporto tecnico e commerciale, indirizzi PEC/istituzionali delle parti.

## **SEZIONE 2: FUNZIONALITÀ CORE (IL MOTORE DEL SITO)**

### **2.1 Il Flusso E-commerce & Marketplace**

Il sistema deve essere sviluppato in modo scalabile per gestire la transizione del modello operativo e applicare filtri automatici sulle merci.

* **Evoluzione del Modello di Business:**  
  * **Fase Iniziale:** Gestione automatizzata del dropshipping e integrazione dei prodotti da fornitori esterni (locati in Italia, Europa e resto del mondo).  
  * **Fase Successiva:** Predisposizione dell'architettura logistica per l'acquisto diretto dei prodotti, gestione di un magazzino proprio e logistica integrata gestita da *Buy All Free LTD*.  
* **Filtri e Classificazione Categorie Merceologiche:**  
  * **Categorie Ammesse:** Commercio online di tutte le categorie di prodotti senza limite merceologico, purché compatibili con il codice etico aziendale. I segmenti di partenza includono: articoli di largo consumo, oggettistica, prodotti per cani e gatti, minuteria elettrica ed elettronica, prodotti per la casa e articoli per hobby.  
  * **Blocco Tassativo Prodotti Esclusi:** Il backend deve includere una "blacklist" che impedisca l'inserimento o la pubblicazione di: monopattini, accendini, prodotti che creano dipendenze, prodotti con elevati tassi di reso e qualsiasi articolo eticamente discutibile.  
* **Controllo Editoriale Centralizzato:** Il sistema non permette la pubblicazione autonoma o la modifica delle pagine se non previa autorizzazione esplicita e validazione da parte del titolare **Antonino Gatto**.

### **2.2 Portale Venditori (Area Partner)**

L'architettura del database deve supportare un sistema di login scalabile con permessi dedicati per consentire l'interazione controllata di terze parti.

* **Processo di Candidatura e Convenzionamento:**  
  * Gli utenti possono candidarsi come venditori attraverso un portale di registrazione dedicato.  
  * Prima di ottenere l'accesso operativo, gli esercenti devono accettare obbligatoriamente i termini legali e le condizioni contrattuali necessarie per potersi convenzionare con la società *Buy All Free LTD*.  
* **Autonomia Limitata e Sicurezza:**  
  * Successivamente all'accettazione e alla validazione dell'account, gli esercenti convenzionati acquisiscono la facoltà di caricare in modo autonomo i propri prodotti sul marketplace.  
  * Ogni account venditore è protetto da password dedicate e opera in modalità sicura con limitazioni rigide per il singolo profilo, impedendo qualsiasi azione al di fuori del proprio catalogo.

### **2.3 Il Sistema Cashback**

La gestione dei flussi finanziari legati ai rimborsi deve essere blindata per evitare speculazioni e attacchi informatici.

* **Regole di Calcolo delle Percentuali:**  
  * Il cashback è variabile e oscilla indicativamente **dal 5% al 35%**.  
  * L'algoritmo deve calcolare la percentuale esatta basandosi dinamicamente sul margine commerciale del singolo prodotto, impostando una priorità di visibilità per i prodotti che consentono cashback più elevati.  
* **Vincoli Rigidi di Accredito:**  
  * Il cashback viene visualizzato temporaneamente come "sospeso".  
  * L'accredito effettivo sul saldo dell'utente avviene solo ed esclusivamente al verificarsi delle seguenti condizioni: consegna avvenuta del prodotto **E** scadenza del termine legale del diritto di recesso (oppure in caso di esplicita rinuncia anticipata al diritto di recesso da parte del cliente).  
* **Natura Non Prelivabile dei Fondi:**  
  * I fondi finanziari non vengono mai trasferiti al cliente, ma rimangono depositati sul conto corrente di *Buy All Free LTD*.  
  * L'applicazione e il sito mostrano al cliente esclusivamente un saldo contabile interno. Questo saldo è utilizzabile unicamente come credito interno per effettuare nuovi acquisti sulla piattaforma e varia in tempo reale in base all'utilizzo o alla generazione di nuovo cashback.

### **2.4 Il Sistema Referral & Tokenizzazione**

Il motore dei referral rappresenta uno dei pilastri di crescita della piattaforma e deve connettersi direttamente alla gestione del saldo dell'utente.

* **Struttura dei Link Referral:**  
  * Ogni utente registrato riceve un link referral personale univoco.  
  * Il sistema permette inviti illimitati.  
  * Quando un utente terzo effettua un acquisto utilizzando il link referral di un utente, il sistema genera automaticamente un cashback premio che si somma istantaneamente al saldo esistente del promotore.  
* **Architettura Multilivello e Tokenizzazione:**  
  * Il backend deve essere predisposto per supportare un piano di premi multilivello (i cui livelli verranno definiti nel piano marketing dinamico).  
  * Il database e le interfacce utente devono essere progettati per una futura integrazione nativa del **Whe\&Back Coin**, un token digitale collegato all'ecosistema che nelle fasi successive del progetto sarà supportato da asset reali.

## **SEZIONE 3: SICUREZZA, LEGALE E GESTIONE DATI (BACKEND & COMPLIANCE)**

### **3.1 Profilazione Utenti & Controllo Accessi**

L'architettura del database deve strutturare un sistema di controllo degli accessi basato sui ruoli (RBAC) per garantire la massima segregazione dei permessi.

* **Account Cliente:** Profilo base che permette la navigazione, la gestione del proprio link referral, la visualizzazione del saldo cashback e l'effettuazione di acquisti.  
* **Account Venditore (Esercente Convenzionato):** Accesso protetto da credenziali e password dedicate. Permette il caricamento e la gestione autonoma dei propri prodotti sul portale in modalità sicura, con limitazioni rigide applicate al singolo account.  
* **Account Amministratore (Admin Dashboard):** Accesso totale riservato alla gestione della piattaforma e del personale aziendale autorizzato in tutto il mondo. Nessuna modifica strutturale o pubblicazione di pagine può essere resa definitiva in modo autonomo senza la validazione del titolare **Antonino Gatto**.

### **3.2 Protezione Anti-Frode e Anti-Hacker**

Il sistema deve essere progettato con un livello di sicurezza tale da risultare inattaccabile da hacker o terzi malintenzionati che abbiano interesse a danneggiare la piattaforma.

* **Sicurezza Infrastrutturale:** Implementazione di precauzioni rigorose e firewall per impedire l'interruzione dei processi legati al sito e bloccare accessi non autorizzati, considerando l'alto livello di competitività internazionale del progetto (target competitivo vs principali e-commerce globali/Amazon).  
* **Algoritmo Anti-Speculazione:** Il backend deve integrare un sistema di monitoraggio automatico dei comportamenti anomali dei clienti. Ogni situazione che indichi attività speculative, procedure illecite per generare guadagni incontrollati o violazioni dei Termini e Condizioni deve essere tempestivamente segnalata e bloccata dal sistema.

### **3.3 Tutela dei Minori**

In linea con i concetti etici della piattaforma, lo sviluppo deve prevedere barriere informatiche stringenti a protezione dei più giovani.

* **Limitazione dell'Accesso:** Il sito deve integrare sistemi di verifica o messaggi di controllo per limitare l'accesso ai minori di età che non siano espressamente accompagnati dai genitori.  
* **Blocco Tassativo dei Pagamenti:** È fatto divieto assoluto al sistema di elaborare, autorizzare o accettare transazioni finanziarie e pagamenti diretti eseguiti da utenti minori d'età.

### **3.4 Privacy & Trattamento Dati (GDPR / Iubenda)**

Il trattamento delle informazioni degli utenti deve conformarsi perfettamente alle normative europee e internazionali vigenti.

* **Principio di Minimizzazione:** In fase di registrazione, il frontend deve consentire l'inserimento del minor numero possibile di dati personali, limitandosi a quelli strettamente necessari all'identificazione univoca dell'utente nel mondo.  
* **Integrazione Legale:** La raccolta e il trattamento dei dati devono essere vincolati all'accettazione esplicita della Privacy Policy. Lo sviluppo prevede l'integrazione e la collaborazione attiva con i servizi di **Iubenda** per la generazione, l'aggiornamento e l'espansione automatica delle pagine relative a Cookie Policy, Privacy Policy e Termini e Condizioni del sito.  
* **Conservazione e Diritti:** I dati saranno conservati solo per il tempo necessario ad adempiere alle finalità del servizio. Gli utenti mantengono il pieno diritto di accesso, rettifica, cancellazione, limitazione e opposizione, oltre alla facoltà di proporre reclamo al Garante Privacy o alle relative autorità di controllo.

### **3.5 Gestione Economica e Beneficenza**

La logica finanziaria della piattaforma deve riflettere fedelmente i patti commerciali della società *Buy All Free LTD* e i suoi impegni solidali.

* **Rendicontazione e Calcolo delle Royalty:**  
  * Il backend deve calcolare ogni 3 mesi (a cadenza trimestrale) le royalty dovute dal Licenziatario (*Buy All Free LTD*) al Licenziante (*Antonino Gatto*).  
  * Il calcolo si basa su una royalty pari allo **0,3% del fatturato totale** oltre a una **quota fissa annuale di €12.000,00** (più IVA, se dovuta) con pagamento a cadenza annuale.  
  * Indipendentemente dall'effettivo ammontare, il sistema deve considerare un importo minimo garantito di royalty pari a **€12.000,00 per ogni anno**, che si somma alla quota fissa annuale di €12.000,00 (totale minimale dovuto: €24.000,00/anno oltre IVA).  
  * Il sistema deve strutturare tabelle per consentire la trasmissione di un rendiconto completo e la verifica delle scritture contabili da parte di un esperto prescelto dal Licenziante.  
* **Automazione Beneficenza:** La società *Buy All Free LTD* devolverà mensilmente l'1% del fatturato totale a favore dell'Associazione *"Il Segreto di Aladino"*. Il backend deve aggregare questi dati finanziari per produrre report mensili trasparenti e documentazione ufficiale da pubblicare sul sito di Whe\&Back e da condividere con l'associazione.  
* **Foro Competente e Trasparenza:** In conformità con il contratto stipulato a Londra, la piattaforma e i suoi accordi sono regolati dal **diritto italiano**. Qualsiasi controversia legale in ordine a interpretazione, validità ed esecuzione dell'accordo è devoluta alla competenza esclusiva del **Foro di Milano**.

