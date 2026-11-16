const Sequelize = require("sequelize");
const { Habitaciones } = require("../db.js");

const updateHabitacion = async (  
  nombreId,
  nombre,
  precio,
  imagenes,
  servicios,
  descripcion,
  estado) => {

    if (!nombreId) {
      return 'No existe una habitacion con ese nombre';
    }

    let habitacion = await Habitaciones.findOne({
      where: {
        id: nombreId,
      }
    });

    if (!habitacion) {
      return 'No existe una habitacion con ese nombre' ;
    }
    
    if (nombre?.trim()) {
      habitacion.nombre = nombre.trim();
    }
    if (precio !== "") {
      habitacion.precio = precio;
    }
    if (imagenes !== "") {
      habitacion.imagenes = imagenes;
    }
    if (servicios !== "") {
      habitacion.servicios = servicios;
    }
  
    if (descripcion !== "") {
      habitacion.descripcion = descripcion;
    }

    if (estado !== "") {
      habitacion.estado = estado;
    }
    await habitacion.save();

    return habitacion;

}

module.exports = { updateHabitacion };