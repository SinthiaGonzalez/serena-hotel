const nodemailer = require("nodemailer");
require("dotenv").config();

// Gmail solo deja enviar como la cuenta autenticada: el remitente sale de GMAIL_USER
const transporter = nodemailer.createTransport(
  {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD, // contraseña de aplicación de Google, no la de la cuenta
    },
  },
  { from: `"Serena Hotel" <${process.env.GMAIL_USER}>` }
);

module.exports = { transporter };
