require("dotenv").config();
const Stripe = require("stripe");
const { Carrito, Habitaciones, Pago } = require("../db");
const { postReservasPagos } = require("./postReservaspago");
const { centimosNocheConIva } = require("../utils/precios");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const DIA_MS = 24 * 60 * 60 * 1000;

// POST /checkout/session -> crea la sesión de Stripe Checkout con el carrito del usuario.
// El precio sale de la base de datos, nunca del front.
const crearCheckoutSession = async (req, res) => {
  try {
    const { userId, fecha_entrada, fecha_salida } = req.body;
    const noches = Math.round((new Date(fecha_salida) - new Date(fecha_entrada)) / DIA_MS);
    if (!userId || !(noches >= 1)) {
      return res.status(400).json({ error: "Faltan el usuario o las fechas de la reserva" });
    }

    const carrito = await Carrito.findOne({
      where: { usuarioId: userId },
      include: [{ model: Habitaciones }],
    });
    if (!carrito || !carrito.Habitaciones.length) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "es",
      line_items: carrito.Habitaciones.map((h) => ({
        quantity: noches,
        price_data: {
          currency: "eur",
          unit_amount: centimosNocheConIva(h.precio),
          product_data: {
            name: h.nombre,
            description: `${noches} noche(s) · IVA 10% incluido`,
            images: h.imagenes.slice(0, 1),
          },
        },
      })),
      // Lo que se paga viaja con la sesión: si el carrito cambia después, la reserva no.
      metadata: {
        userId: String(userId),
        fecha_entrada,
        fecha_salida,
        habitaciones: carrito.Habitaciones.map((h) => h.id).join(","),
      },
      success_url: `${process.env.FRONT_URL}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONT_URL}/pago-rechazado`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error al crear la sesión de Stripe:", error.message);
    res.status(500).json({ error: "No se pudo iniciar el pago" });
  }
};

// Crea el Pago y la reserva si la sesión está pagada. Idempotente: el webhook
// y la página de éxito pueden llamarla los dos sin duplicar la reserva.
// ponytail: Pago y reserva no van en una transacción; si la reserva falla queda el pago registrado sin reserva.
const confirmarPago = async (sessionId) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") return { pagado: false };

  const { userId, fecha_entrada, fecha_salida, habitaciones } = session.metadata;
  const [, creado] = await Pago.findOrCreate({
    where: { stripe_session_id: session.id },
    defaults: { estado: session.payment_status, monto: session.amount_total, usuarioId: userId },
  });

  if (creado) {
    const reserva = await postReservasPagos(fecha_entrada, fecha_salida, true, habitaciones.split(","), userId);
    if (reserva.error) throw new Error(`Pago ${session.id} sin reserva: ${reserva.error}`);
    await Carrito.destroy({ where: { usuarioId: userId } });
  }
  return { pagado: true };
};

// POST /checkout/confirmar -> lo llama la página de éxito al volver de Stripe.
const confirmarCheckout = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Falta sessionId" });
    res.json(await confirmarPago(sessionId));
  } catch (error) {
    console.error("Error al confirmar el pago:", error.message);
    res.status(500).json({ error: "No se pudo confirmar el pago" });
  }
};

// POST /webhook/stripe -> Stripe avisa del pago. Necesita el body sin parsear (express.raw en app.js).
const stripeWebhook = async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook inválido: ${error.message}`);
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await confirmarPago(event.data.object.id);
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Error procesando el webhook:", error.message);
    res.status(500).end(); // Stripe reintenta
  }
};

module.exports = { crearCheckoutSession, confirmarCheckout, stripeWebhook };
