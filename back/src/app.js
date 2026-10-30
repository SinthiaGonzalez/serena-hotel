const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const router = require("./routes/index.js");
const cors = require("cors");
const { stripeWebhook } = require("./Controladores/pagosStripe.js");

require("./db.js");

const server = express();

server.name = "API"; // nombre del servidor aunqye no lo modifica ya que sigue siendo app
// Detrás de Caddy, que pone en X-Forwarded-For la IP real (CF-Connecting-IP): así rate-limit ve a cada visitante
server.set("trust proxy", 1);
server.use(helmet());
server.use(cors({ origin: process.env.FRONT_URL }));
// El webhook de Stripe valida la firma sobre el body crudo: va antes de express.json()
server.post("/webhook/stripe", express.raw({ type: "application/json" }), stripeWebhook);
server.use(express.json());
server.use(cookieParser());
server.use(morgan("dev"));
server.use("/", router); // cuando llegue una solicitud a la ruta '/' se ejecuta el archivo routes/index.js donde esatn importadas todas las rutas que creamos en la carpeta routes

// mideleware de error, captura los errores y los envia al front end
server.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server; // exportamos el servidor para poder usarlo en otros archivos
