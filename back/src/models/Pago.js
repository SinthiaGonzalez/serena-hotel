const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Pago", {
    stripe_session_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    estado: {
      type: DataTypes.STRING, // payment_status de Stripe: paid | unpaid | no_payment_required
      allowNull: false,
    },
    monto: {
      type: DataTypes.INTEGER, // total cobrado en céntimos de euro
      allowNull: false,
    },
  });
};
