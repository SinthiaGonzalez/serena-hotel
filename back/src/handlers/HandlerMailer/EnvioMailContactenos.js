const { transporter } = require("./NodeMailerTransporter");

// Lo que escribe el usuario va dentro del HTML del mail: se escapa para que no pueda inyectar etiquetas
const escapar = (texto = "") =>
  String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const EnvioMailContactenos = async (req, res) => {
  const { nombre, correo, telefono, mensaje } = req.body;
  if (!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: "Faltan el nombre, el correo o el mensaje" });
  }

  try {
    await transporter.sendMail({
      to: process.env.CONTACT_EMAIL || process.env.GMAIL_USER,
      replyTo: correo, // "Responder" en el mail le contesta directo a quien escribió
      subject: `Consulta de ${nombre} desde el formulario de contacto`,
      html: `
        <p><strong>Nombre:</strong> ${escapar(nombre)}</p>
        <p><strong>Correo:</strong> ${escapar(correo)}</p>
        <p><strong>Teléfono:</strong> ${escapar(telefono)}</p>
        <p><strong>Mensaje:</strong> ${escapar(mensaje)}</p>
      `,
    });

    res.status(200).json({ message: "Consulta enviada correctamente" });
  } catch (error) {
    console.error("Error durante el envío del correo:", error.message);
    res.status(500).json({ error: "No se pudo enviar la consulta. Inténtalo más tarde." });
  }
};

module.exports = { EnvioMailContactenos };
