const { Usuario } = require("../db.js");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const responderConToken = (res, user) => {
  const { id: userId, isadmin: isAdmin, imagen, name, estado } = user;
  const token = jwt.sign({ userId, isAdmin, imagen, name, estado }, process.env.ACCES_JWT, { expiresIn: "1h" });
  res.json({ message: "Autenticación exitosa", token, userId, isAdmin, imagen, name, estado });
};

const loginCreateToken = async (req, res) => {
  try {
    const { email, contraseña } = req.body;
    if (!email || !contraseña) {
      return res.status(400).json({ message: "Debes proporcionar correo y contraseña" });
    }

    const user = await Usuario.findOne({ where: { email } });
    if (!user || !(await user.validarContraseña(contraseña))) {
      return res.status(400).json({ message: "Usuario o contraseña inválidos" });
    }
    responderConToken(res, user);
  } catch (error) {
    console.error("Error al crear el token", error);
    res.status(500).json({ message: "Error al crear el token" });
  }
};

// Recibe el ID token que Google le da al front y lo verifica acá:
// los datos del usuario salen del token firmado, nunca del body.
const loginGoogle = async (req, res) => {
  let datos;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    datos = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: "Token de Google inválido" });
  }
  if (!datos.email_verified) {
    return res.status(401).json({ message: "El correo de Google no está verificado" });
  }

  try {
    const [user] = await Usuario.findOrCreate({
      where: { email: datos.email },
      defaults: {
        name: datos.given_name || datos.name,
        apellido: datos.family_name,
        ...(datos.picture && { imagen: datos.picture }),
      },
    });
    responderConToken(res, user);
  } catch (error) {
    console.error("Error en login con Google", error);
    res.status(500).json({ message: "Error al iniciar sesión con Google" });
  }
};

module.exports = { loginCreateToken, loginGoogle };
