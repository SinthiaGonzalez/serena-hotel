const jwt = require("jsonwebtoken");
require("dotenv").config();

// Exige un JWT válido en "Authorization: Bearer <token>"
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado: iniciá sesión" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCES_JWT);
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin || false;
    next();
  } catch {
    res.status(401).json({ message: "Sesión inválida o expirada" });
  }
};

// Va después de verifyToken
const isAdmin = (req, res, next) => {
  if (!req.isAdmin) return res.status(403).json({ message: "Solo para administradores" });
  next();
};

// El usuario solo puede operar sobre sus propios datos (el admin, sobre cualquiera).
// getId saca el id de usuario del request: params, query o body según la ruta.
const soloPropio = (getId) => (req, res, next) => {
  if (req.isAdmin || String(getId(req)) === String(req.userId)) return next();
  res.status(403).json({ message: "No podés acceder a datos de otro usuario" });
};

module.exports = { verifyToken, isAdmin, soloPropio };
