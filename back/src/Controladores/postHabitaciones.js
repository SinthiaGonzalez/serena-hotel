const Sequelize = require("sequelize");
const { Habitaciones } = require("../db.js");

const postHabitaciones = async (
  nombre,
  precio,
  imagenes,
  servicios,
  descripcion,
  estado
) => {
  // Las imágenes ya llegan subidas a Cloudinary desde el front (URLs)
  nombre = nombre?.trim();
  if (
    !nombre ||
    !precio ||
    !imagenes ||
    !servicios ||
    !descripcion ||
    !estado
  ) {
    return "faltan datos";
  }
  const prueba = await Habitaciones.findOne({ where: { nombre: nombre } });
  if (prueba) return "La habitacion ya existe";
  else {
    const habitacion = await Habitaciones.create({
      nombre,
      precio,
      imagenes: imagenes,
      servicios,
      descripcion,
      estado,
    });
    return habitacion;
  }
};

module.exports = { postHabitaciones };
