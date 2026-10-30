const validation = (habitacionData) => {
  const errors = {};

  if (habitacionData.nombre.trim().length < 3) {
    errors.nombre = "El nombre debe contener al menos 3 caracteres";
  }

  if (habitacionData.descripcion.trim().length < 50) {
    errors.descripcion = "La descripción debe contener al menos 50 caracteres";
  }

  if (habitacionData.servicios.some((s) => !s.descripcion || s.descripcion === " m²")) {
    errors.servicios = "Elige cuartos, personas, cama y m²";
  }

  if (!(Number(habitacionData.precio) > 0)) {
    errors.precio = "El precio debe ser mayor a 0";
  }

  if (habitacionData.imagenes.length === 0) {
    errors.imagen = "Sube al menos una imagen";
  }
  return errors;
};

export default validation;
