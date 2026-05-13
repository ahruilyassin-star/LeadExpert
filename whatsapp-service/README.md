# WhatsApp Service

Zelf-gehoste WhatsApp service op basis van het Baileys protocol (zelfde als Evolution API).

## Starten

```bash
npm install
npm start
```

De service start op **http://localhost:3001**.

Bij de eerste start verschijnt een QR code in de terminal.  
Open WhatsApp op uw telefoon → Menu (⋮) → **Gekoppelde apparaten** → Scan de QR code.

De sessie wordt opgeslagen in de map `sessions/`. Daarna hoeft u de QR nooit meer te scannen (tenzij u uitlogt op uw telefoon).

## API Endpoints

| Methode | URL         | Beschrijving                         |
|---------|-------------|--------------------------------------|
| GET     | `/status`   | Verbindingsstatus opvragen           |
| GET     | `/qr`       | QR code als data-URI ophalen        |
| POST    | `/send`     | WhatsApp bericht versturen           |
| POST    | `/reconnect`| Manueel herverbinden                 |

### POST /send

```json
{
  "phone": "+32472123456",
  "message": "Hallo, dit is een testbericht!"
}
```

## Productie (Railway / Render / VPS)

```bash
# Railway
railway login
railway new
railway up

# Render: gebruik Docker of Node runtime
# Zet PORT environment variabele
```

> ⚠️ De `sessions/` map bewaren tussen deploys (persistent volume).
