// Datos de ejemplo para desarrollo local. Uso: npm run seed (desde /back)
// Es idempotente: se puede correr varias veces sin duplicar nada.
//
// El formato respeta lo que espera el front:
// - servicios: [{ icono, descripcion }] en el mismo orden que CrearHabitaciones.jsx
//   (icono = nombre de Material Symbols). El filtro del back busca
//   descripcion === "N pers" y "N cuartos" exactos.
// - imagenes: array de URLs (el front usa imagenes[0] como portada).
// - precio: euros por noche, sin IVA (el checkout suma el 10%).
//
// Usuarios demo (el modelo hashea la contraseña con bcrypt al guardar):
//   admin@serena.com / admin123  (isadmin)
//   cliente@serena.com / cliente123
const { conn, Usuario, Habitaciones, Reservas, Comentario } = require("./db");

const img = (id, k) =>
  `https://cf.bstatic.com/xdata/images/hotel/max1280x900/${id}.jpg?k=${k}&o=&hp=1`;
const FOTOS = [
  img("283384657", "82f12511a23fc911e79146601860d7ae7b9839f37af39918d1312edd9d98efee"),
  img("283384658", "2aeaf188b3885dc56bd2e2f663bc480961545e397af4ef10e68513f0713ef775"),
  img("283386242", "4fba1a260c2560d019a8ddd5c3d14574580e3723e95d09cdc41b6f518b9152b2"),
  img("283386255", "eb27a7e8573da8ef768322217f1b42b6c5be3a2b798d7fe7ed1562f8856e3e99"),
  img("283386290", "076307a954ed5cd9c8f0d24e5154c55196280953b5b37f1aae76d6a1008e3891"),
  img("283386297", "9ae9ef7f483cfbaed5aca3c30b531bfd49a921b1a46659ad9a2a2028a854588c"),
  img("283383052", "521e491ee78b3913f2c552db2596eb747a7fd5f7cc852331ba44ff443bbc2e01"),
  img("283383307", "12c5e34a3700c80fbb452a6113f34f6dfa5659d66a1c73cc3fbf479f208ccd50"),
];

const servicios = (cuartos, pers, cama, m2) => [
  { icono: "sensor_door", descripcion: `${cuartos} cuartos` },
  { icono: "person", descripcion: `${pers} pers` },
  { icono: "bed", descripcion: cama },
  { icono: "home", descripcion: `${m2} m²` },
  { icono: "local_bar", descripcion: "Minibar" },
  { icono: "wifi", descripcion: "WIFI" },
];

const HABITACIONES = [
  { nombre: "Cabaña Bosque", precio: 90, servicios: servicios(1, 1, "Single", 25),
    descripcion: "Cabaña íntima rodeada de bosque nativo, ideal para viajeros solos que buscan silencio y naturaleza." },
  { nombre: "Cabaña Lago", precio: 120, servicios: servicios(1, 2, "Queen", 35),
    descripcion: "Vista directa al lago, deck privado y chimenea a leña. Perfecta para parejas." },
  { nombre: "Ejecutiva", precio: 145, servicios: servicios(2, 2, "King", 45),
    descripcion: "Espacio de trabajo, escritorio amplio y conexión de alta velocidad, sin renunciar al descanso." },
  { nombre: "Delux", precio: 190, servicios: servicios(2, 3, "King", 60),
    descripcion: "Cabaña de dos ambientes con jacuzzi, living con hogar y ventanales hacia la montaña." },
  { nombre: "Cabaña Familiar", precio: 230, servicios: servicios(3, 4, "Double", 80),
    descripcion: "Tres cuartos, cocina equipada y parrilla propia. Pensada para familias o grupos de amigos." },
  { nombre: "Suite Presidencial", precio: 420, servicios: servicios(4, 4, "King", 120),
    descripcion: "La experiencia más exclusiva de Serena: spa privado, terraza panorámica y atención personalizada." },
].map((h, i) => ({
  ...h,
  imagenes: [FOTOS[i % FOTOS.length], FOTOS[(i + 1) % FOTOS.length], FOTOS[(i + 2) % FOTOS.length]],
}));

const USUARIOS = [
  { name: "Admin", apellido: "Serena", email: "admin@serena.com", contraseña: "admin123", isadmin: true, telefono: "1100000000" },
  { name: "Cliente", apellido: "Demo", email: "cliente@serena.com", contraseña: "cliente123", telefono: "1111111111" },
  { name: "Lucía", apellido: "Fernández", email: "lucia@ejemplo.com", contraseña: "demo1234", telefono: "1122222222" },
  { name: "Martín", apellido: "Gómez", email: "martin@ejemplo.com", contraseña: "demo1234", telefono: "1133333333" },
  { name: "Sofía", apellido: "Ramírez", email: "sofia@ejemplo.com", contraseña: "demo1234", telefono: "1144444444" },
];

// Un comentario por usuario (el back lo exige vía usuarioId)
const COMENTARIOS = [
  { email: "cliente@serena.com", contenido: "Un lugar mágico, la cabaña del lago superó todas nuestras expectativas.", puntuacion: 5 },
  { email: "lucia@ejemplo.com", contenido: "Excelente atención y el desayuno buenísimo. Volveremos en invierno.", puntuacion: 5 },
  { email: "martin@ejemplo.com", contenido: "Muy lindo entorno y tranquilo. El wifi a veces fallaba un poco.", puntuacion: 4 },
  { email: "sofia@ejemplo.com", contenido: "La suite presidencial vale cada peso, el spa privado es increíble.", puntuacion: 5 },
];

// fechas relativas a hoy (YYYY-MM-DD) para que el dashboard siempre muestre datos
const dia = (offset) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);
const RESERVAS = [
  { email: "cliente@serena.com", habitacion: "Cabaña Lago", entrada: dia(-30), salida: dia(-27), estado: true },
  { email: "lucia@ejemplo.com", habitacion: "Delux", entrada: dia(-12), salida: dia(-9), estado: true },
  { email: "martin@ejemplo.com", habitacion: "Ejecutiva", entrada: dia(10), salida: dia(13), estado: true },
  { email: "sofia@ejemplo.com", habitacion: "Suite Presidencial", entrada: dia(20), salida: dia(24), estado: true },
];

const seed = async () => {
  await conn.sync({ force: false });

  const habitaciones = {};
  for (const h of HABITACIONES) {
    const [hab, creada] = await Habitaciones.findOrCreate({ where: { nombre: h.nombre }, defaults: h });
    if (!creada) await hab.update({ precio: h.precio }); // precios en EUR
    habitaciones[h.nombre] = hab;
  }

  const usuarios = {};
  for (const u of USUARIOS) {
    const [user] = await Usuario.findOrCreate({ where: { email: u.email }, defaults: u });
    // Usuarios demo creados antes de bcrypt: guardan la clave en texto plano
    if (!user.contraseña?.startsWith("$2")) {
      user.changed("contraseña", true); // mismo valor: sin esto el hook no se dispara
      await user.save();
    }
    usuarios[u.email] = user;
  }

  for (const c of COMENTARIOS) {
    const user = usuarios[c.email];
    await Comentario.findOrCreate({
      where: { usuarioId: user.id },
      defaults: { imagen: user.imagen, nombre: `${user.name} ${user.apellido}`, contenido: c.contenido, puntuacion: c.puntuacion, fecha: new Date() },
    });
  }

  for (const r of RESERVAS) {
    const usuarioId = usuarios[r.email].id;
    if (await Reservas.findOne({ where: { usuarioId } })) continue;
    const reserva = await Reservas.create({ fecha_entrada: r.entrada, fecha_salida: r.salida, estado: r.estado, usuarioId });
    await reserva.addHabitaciones([habitaciones[r.habitacion]]);
  }

  console.log(`Seed OK: ${HABITACIONES.length} habitaciones, ${USUARIOS.length} usuarios, ${COMENTARIOS.length} comentarios, ${RESERVAS.length} reservas`);
};

seed()
  .catch((err) => {
    console.error("Seed falló:", err);
    process.exitCode = 1;
  })
  .finally(() => conn.close());
