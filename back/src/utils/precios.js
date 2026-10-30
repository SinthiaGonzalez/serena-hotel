const IVA = 0.1; // IVA reducido de hostelería en España

// Céntimos por noche con IVA incluido: es exactamente lo que se cobra en Stripe
const centimosNocheConIva = (precio) => Math.round(precio * (1 + IVA) * 100);

module.exports = { IVA, centimosNocheConIva };
