const { Usuario } = require('../../db')

const CreateUsuario = async (req, res) => {
  try {
    // isadmin y estado no se aceptan del body: el registro público siempre crea clientes activos
    const { name, apellido, email, telefono, contraseña, imagen } = req.body;
    const prueba = await Usuario.findOne({ where: { email: email } });
    if (prueba) {
      return res.status(409).json({ message: "Ya existe un usuario vinculado a ese correo" })
    } else {
      const newUser = await Usuario.create({
        name,
        apellido,
        email,
        telefono,
        contraseña,
        imagen

      });
      return res.status(200).json(newUser);
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: error.message });

  }
};



module.exports = { CreateUsuario };
