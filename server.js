require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");

const app = express();
const PORT = process.env.PORT || 3000;

// Configura SendGrid con la tua API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.json());

// Endpoint per il webhook
app.post("/webhook", async (req, res) => {
    try {
        const order = req.body;
        const discountCodes = order.discount_codes || [];

        // Controlla se è stato usato il codice specifico
        const influencerCode = "INFLUENCER10";
        const codeUsed = discountCodes.some(code => code.code === influencerCode);

        if (codeUsed) {
            const influencerEmail = process.env.INFLUENCER_EMAIL;
            const orderId = order.id;
            const orderTotal = order.total_price;

            // Prepara l'email
            const msg = {
                to: influencerEmail,
                from: process.env.FROM_EMAIL,
                subject: `Un ordine è stato effettuato con il tuo codice sconto!`,
                text: `Il codice ${influencerCode} è stato usato! Dettagli:\n\nOrdine ID: ${orderId}\nImporto Totale: ${orderTotal}€`,
            };

            // Invia l’email
            await sgMail.send(msg);
            console.log("Email inviata all'influencer.");
        }

        res.status(200).send("Webhook ricevuto con successo.");
    } catch (error) {
        console.error("Errore nel webhook:", error);
        res.status(500).send("Errore nel webhook.");
    }
});

app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});