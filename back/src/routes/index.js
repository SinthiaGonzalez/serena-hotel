const express = require("express");
const { CreateComentario } = require("../Controladores/PostComentarios");
const { AllComentariosdHandler } = require("../handlers/AllComentariosHandler");
const {
  ActualizarComentarioHandler,
} = require("../handlers/ActualizarComentarioHnadler");
const {
  EliminarComentariosHandler,
} = require("../handlers/EliminarComentaiosHandler");
const {
  CreateUsuario,
} = require("../Controladores/controllers_Usuaruios/PostUsuario");
const {
  crearCheckoutSession,
  confirmarCheckout,
} = require("../Controladores/pagosStripe");

const {
  EnvioMailContactenos,
} = require("../handlers/HandlerMailer/EnvioMailContactenos");
const { getHabitacionHandler } = require("../handlers/HabitacionHandler");
const {
  addHabitacionToCarrito,
  getCarrito,
} = require("../Controladores/carritoControlador");
const { postHabitacionHandler } = require("../handlers/HabitacionHandler");
const { eliminarHabitacionHandler } = require("../handlers/HabitacionHandler");
const {
  postReservasHandler,
  deleteReservasHandler,
} = require("../handlers/ReservasHandler");
const { getReservas } = require("../Controladores/getReservas");
const {
  getReservasPorUsuarioId,
} = require("../Controladores/getReservasPorUsuarioId");
const { getReservasTodas } = require("../Controladores/getReservasTodas");
const {
  getOrdenamientosFiltrosHandler,
} = require("../Controladores/getOrdenamientosFiltrosHandler");
const { verifyToken, isAdmin, soloPropio } = require("../Controladores/verify-token");
const rateLimit = require("express-rate-limit");
const { loginCreateToken, loginGoogle } = require("../Controladores/login-token");
const {
  HandlerPostDesarrollador,
} = require("../handlers/HandlersDesarrolladores/PostHandlersDesarrolladores");
const {
  GetHandlerDesarrolladores,
} = require("../handlers/HandlersDesarrolladores/GetHandlerDesarrolladores");
const {
  EliminarDesarrolladorHandler,
} = require("../handlers/HandlersDesarrolladores/EliminarDesarrolladorHandler");

const {
  getHandlerUsuarios,
} = require("../handlers/HandlersUsuarios/GetHandlerUsuarios");
const { updateHabitacionHandler } = require("../handlers/HabitacionHandler");
const {
  putUsuarioHandler,
  putUsuarioEstadoHandler,
} = require("../handlers/HandlersUsuarios/PutAndDeleteUsuarios");
const {
  deleteUsuarioHandler,
} = require("../handlers/HandlersUsuarios/PutAndDeleteUsuarios");
//importamos el metodo Router de express para poder crear rutas
const {
  EnvioMailNotificaciones,
} = require("../handlers/HandlerMailer/EnvioMailNotificaciones");
const {
  RecuperarContraseña,
  RestablecerContraseña,
} = require("../handlers/HandlerMailer/RecuperarContraseña/RecuperarContraseña");
const {
  HanlderHabitacionDetail,
} = require("../handlers/HabitacionDetailHandler");

const { deleteCarrito } = require("../Controladores/carritoControlador");
const {
  getUsuarioByIdHandler,
} = require("../handlers/HandlersUsuarios/GetHandlerUsuarios");

const router = express.Router(); // importamos el metodo Router de express para poder crear rutas

// Atajos de protección: logueado (auth), admin, o dueño del recurso (propio)
const auth = verifyToken;
const admin = [verifyToken, isAdmin];
const propio = (getId) => [verifyToken, soloPropio(getId)];
// Freno a fuerza bruta en login y recuperación: 10 intentos cada 15 min por IP
const limite = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { message: "Demasiados intentos, probá de nuevo en unos minutos" } });

// ---- Públicas ----
router.get("/", (req, res) => {
  res.send("Soy el server activo");
});
router.post("/login", limite, loginCreateToken);
router.post("/login/google", limite, loginGoogle);
router.post("/usuario", CreateUsuario);
router.put("/recuperarContrasena", limite, RecuperarContraseña);
router.put("/recuperarUsuario", limite, RecuperarContraseña); // mismo enlace; al usarlo reactiva la cuenta
router.post("/restablecerContrasena", limite, RestablecerContraseña);
router.get("/habitaciones", getHabitacionHandler);
router.get("/habitaciones/:id", HanlderHabitacionDetail);
router.get("/ordenamientos&filtros", getOrdenamientosFiltrosHandler);
router.get("/reservas", getReservas); // disponibilidad por fechas
router.get("/comentarios", AllComentariosdHandler);
router.get("/desarrolladores", GetHandlerDesarrolladores);
router.post("/contactenos", limite, EnvioMailContactenos);
router.post("/checkout/confirmar", confirmarCheckout); // se valida contra Stripe con el session_id

// ---- Usuario logueado (solo sus propios datos) ----
router.get("/verify", auth, (req, res) => {
  res.status(200).json({ message: "acceso correcto", userId: req.userId, isAdmin: req.isAdmin });
});
router.get("/usuario/:id", propio((req) => req.params.id), getUsuarioByIdHandler);
router.put("/update/usuarios/:id", propio((req) => req.params.id), putUsuarioHandler);
router.put("/update/usuarioEstado", propio((req) => req.body.id), putUsuarioEstadoHandler);
router.post("/comentar", propio((req) => req.body.idUsuario), CreateComentario);
router.get("/carrito/:id", propio((req) => req.params.id), getCarrito);
router.post("/carrito", propio((req) => req.body.idUser), addHabitacionToCarrito);
router.delete("/carrito", propio((req) => req.query.userId), deleteCarrito);
router.get("/reservas-por-usuario", propio((req) => req.query.id), getReservasPorUsuarioId); // sin id = todas (solo admin)
router.post("/checkout/session", propio((req) => req.body.userId), crearCheckoutSession);

// ---- Admin ----
router.get("/usuarios", admin, getHandlerUsuarios);
router.delete("/delete/usuarios/:id", admin, deleteUsuarioHandler);
router.post("/post/habitaciones", admin, postHabitacionHandler);
router.put("/update/habitaciones", admin, updateHabitacionHandler);
router.delete("/habitaciones/:id", admin, eliminarHabitacionHandler);
router.post("/reservas", admin, postReservasHandler);
router.get("/reservas-todas", admin, getReservasTodas);
router.delete("/reservas/delete/:id", admin, deleteReservasHandler);
router.put("/comentarios/:id", admin, ActualizarComentarioHandler);
router.delete("/comentario/:id", admin, EliminarComentariosHandler);
router.post("/desarrollador", admin, HandlerPostDesarrollador);
router.delete("/desarrollador/:id", admin, EliminarDesarrolladorHandler);
router.post("/notificaciones", admin, EnvioMailNotificaciones); // manda mails a cualquier destinatario

module.exports = router;
