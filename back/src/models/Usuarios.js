const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const Usuario = sequelize.define(
    "usuario",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      telefono: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contraseña: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isadmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      estado:{ 
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "activo", // "activo"|"inactivo"|"eliminado"
      },
      imagen:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "https://res.cloudinary.com/de2jgnztx/image/upload/v1705619360/habitaciones/dsqhjd0wd9xqe9anigxj.png"
      }
    },
    {
      timestamps: false,
      hooks: {
        // Hashea la contraseña cada vez que cambia (registro, perfil, recuperar, seed)
        beforeSave: async (user) => {
          if (user.changed("contraseña") && user.contraseña) {
            user.contraseña = await bcrypt.hash(user.contraseña, 10);
          }
        },
      },
    }
  );

  Usuario.prototype.validarContraseña = function (contraseña) {
    return !!this.contraseña && bcrypt.compare(contraseña, this.contraseña);
  };

  // El hash nunca sale del servidor
  Usuario.prototype.toJSON = function () {
    const { contraseña, ...datos } = this.get();
    return datos;
  };
};

