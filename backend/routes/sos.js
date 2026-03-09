const express = require("express");
const router = express.Router();
const EmergencyContacts = require("../models/emergencyContacts");

const twilio = require("twilio");



const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

router.post("/contacts", async (req, res) => {

  const { userId, contacts } = req.body;

  const saved = await EmergencyContacts.findOneAndUpdate(
    { userId },
    { contacts },
    { upsert: true,  returnDocument: "after" }
  );

  res.json(saved);
});

router.get("/contacts/:userId", async (req, res) => {

  const contacts = await EmergencyContacts.findOne({
    userId: req.params.userId
  });

  res.json(contacts);

});

const axios = require("axios");


router.post("/send-alert", async (req, res) => {

  try {


    const { userId, latitude, longitude } = req.body;

    const userContacts = await EmergencyContacts.findOne({ userId });

    if (!userContacts) {
      return res.status(404).json({ message: "No contacts found" });
    }

    const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const message =
`🚨 SOS ALERT!

User ${userId} may be in danger.

Location:
${locationLink}`;
    if (!userContacts.contacts || userContacts.contacts.length === 0) {
   return res.status(400).json({ message: "No contacts available" });
}
    for (const contact of userContacts.contacts) {

      if (!contact.phone) continue;

      await client.messages.create({
        body: message,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${contact.phone}`
      });

    }

    res.json({ message: "WhatsApp SOS sent successfully" });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Failed to send WhatsApp alert" });

  }

});
module.exports=router;