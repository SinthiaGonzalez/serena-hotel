const jwt = require("jsonwebtoken");
const { Usuario } = require("../../../db");
const { EnviarNuevaClave } = require("./EnviarNuevaClave");
require("dotenv").config();

// El secreto incluye el hash actual de la contraseña: cuando se cambia,
// el enlace deja de servir (un solo uso) sin guardar nada en la DB.
const secreto = (usuario) => process.env.ACCES_JWT + (usuario.contraseña || "");

const RESPUESTA = { message: "Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña" };

// PUT /recuperarContrasena y /recuperarUsuario { correo }
// Responde siempre lo mismo para no revelar qué correos existen.
const RecuperarContraseña = async (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ error: "Correo no proporcionado" });

  try {
    const usuario = await Usuario.findOne({ where: { email: correo } });
    if (!usuario) return res.status(200).json(RESPUESTA);

    const token = jwt.sign({ userId: usuario.id }, secreto(usuario), { expiresIn: "30m" });
    const enlace = `${process.env.FRONT_URL}/restablecer-contrasena?token=${token}`;

    if (!process.env.GMAIL_USER) {
      console.log("[dev] Sin GMAIL_USER, enlace de recuperación:", enlace);
      return res.status(200).json(RESPUESTA);
    }

    const envio = await EnviarNuevaClave({
      destinatario: correo,
      asunto: "Serena Hotel: crear una nueva contraseña",
      mensaje: `Para crear una nueva contraseña entrá a <a href="${enlace}">este enlace</a>. Vence en 30 minutos.<br>Si no lo pediste, ignorá este correo.`,
    });
    if (!envio.success) return res.status(500).json({ error: "No se pudo enviar el correo" });

    res.status(200).json(RESPUESTA);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

// POST /restablecerContrasena { token, contraseña }
const RestablecerContraseña = async (req, res) => {
  const { token, contraseña } = req.body;
  if (!token || !contraseña || contraseña.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
  }

  try {
    const usuario = await Usuario.findByPk(jwt.decode(token)?.userId);
    if (!usuario) throw new Error();
    jwt.verify(token, secreto(usuario));

    usuario.contraseña = contraseña;
    if (usuario.estado === "eliminar") usuario.estado = "activo"; // recuperar cuenta dada de baja
    await usuario.save();
    res.status(200).json({ message: "Contraseña actualizada, ya podés iniciar sesión" });
  } catch {
    res.status(400).json({ error: "El enlace no es válido o ya venció" });
  }
};

module.exports = { RecuperarContraseña, RestablecerContraseña };
