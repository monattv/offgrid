# OFFGRID — catalogo GitHub Pages + Google Sheets

Starter in HTML/CSS/JavaScript puro, senza framework e senza prodotti preinseriti. Include catalogo, categorie, ricerca, carrello, invio richiesta d'ordine senza pagamento, messaggi, dashboard separata e backend Google Apps Script.

## File
- `index.html`: catalogo pubblico
- `admin.html`: dashboard proprietario (pagina separata)
- `style.css`: tema scuro/chiaro, responsive e animazioni leggere
- `app.js`, `admin.js`: comportamento del sito
- `config.js`: URL del backend
- `Code.gs`: API Apps Script da copiare nel progetto Google
- `README.md`: questa guida

## 1. Pubblica su GitHub Pages
1. Crea un repository GitHub, ad esempio `offgrid-catalogo`.
2. Carica tutti i file della cartella nella radice del repository.
3. In **Settings → Pages**, scegli il branch principale e la cartella `/ (root)`.
4. Attendi il link GitHub Pages e apri `index.html`.

## 2. Crea il Google Sheet
Crea un Google Sheet dedicato. Le tre schede usate dal codice sono:
- `Prodotti` — inventario del catalogo
- `Ordini` — richieste inviate dai clienti
- `Messaggi` — domande inviate dal modulo contatti

Le intestazioni vengono create automaticamente alla prima scrittura. Il codice salva anche un identificativo e una data; gli articoli di un ordine sono serializzati come JSON.

## 3. Configura Apps Script
1. Dal Google Sheet apri **Estensioni → Apps Script**.
2. Sostituisci il contenuto del file `Code.gs` con quello incluso in questo progetto.
3. Salva e autorizza lo script quando richiesto.
4. **Distribuisci → Nuova distribuzione → App web**. Scegli l'esecuzione come proprietario e imposta l'accesso secondo le opzioni offerte dal tuo account.
5. Copia l'URL della web app che termina in `/exec`.
6. Inseriscilo in `config.js` al posto della stringa vuota: `API_URL: "https://script.google.com/macros/s/…/exec"`.

### Importante: limiti e sicurezza
- **Non pubblicare questa versione come sistema di produzione senza aggiungere autenticazione.** GitHub Pages serve file statici: `admin.html` non è protetto da una password server-side e chiunque conosca l'indirizzo può tentare di aprirlo. Un URL nascosto non è sicurezza.
- La web app Apps Script esposta con accesso pubblico può consentire a terzi di inviare ordini/messaggi o modificare il catalogo se l'endpoint non verifica l'identità. Questo starter NON implementa autenticazione del proprietario, anti-spam o autorizzazione robusta per le azioni amministrative.
- Per un negozio vero, proteggi le azioni dashboard con login/autorizzazione server-side (ad esempio Firebase Authentication + backend con verifica dei token, oppure un backend che controlla l'account Google del proprietario). Non mettere password, API key private o credenziali nel JavaScript pubblicato.
- Il collegamento cross-origin GitHub Pages → Apps Script può dipendere dal browser e dalla configurazione di distribuzione. Testa in una copia privata prima di condividere il sito; se il browser blocca la richiesta, serve un backend con CORS/auth gestiti correttamente.
- La modalità demo salva dati nel browser corrente (localStorage/sessionStorage): **non** condivide i dati tra dispositivi e non scrive su Google Sheets.
- Il modulo raccoglie dati personali (nome, indirizzo, CAP, paese, telefono, eventuale email): prima di pubblicarlo davvero, aggiungi informativa privacy, finalità, tempi di conservazione e una base giuridica adeguata. Il checkbox attuale è solo un esempio, non sostituisce una privacy policy conforme al GDPR.
- Per scarpe e abbigliamento firmato, pubblica solo articoli autentici e usa immagini per cui hai i diritti.

## Funzioni incluse
- Sidebar con Abbigliamento, Scarpe, Oggetti 3D, NFC, Portachiavi, Accessori Moto 3D e Vario.
- Ricerca generale, ordinamento, disponibilità e quantità, carrello con quantità.
- Checkout senza pagamento: nome, cognome, via, CAP, paese, telefono; richiesta da confermare manualmente.
- Modulo messaggi.
- Dashboard per aggiungere/modificare/eliminare prodotti, prezzo, descrizione, titolo, categoria, immagine, quantità e disponibilità.
- Schede ordini e messaggi, cambio stato ordine, esportazione CSV e tema chiaro/scuro.
- Layout responsive e animazioni con supporto a `prefers-reduced-motion`.

## Nota sul collegamento
La dashboard attuale legge gli ordini e i messaggi dal browser locale. Per mostrare nella dashboard i dati remoti provenienti da Google Sheets, serve aggiungere endpoint di lettura autenticati per ordini e messaggi e un flusso di login. Non esporre mai i dati personali degli ordini in un endpoint pubblico. Questa versione è quindi una base da personalizzare, non ancora un negozio pronto per gestire clienti reali.
