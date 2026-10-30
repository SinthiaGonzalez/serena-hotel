import { useSelector } from "react-redux";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const IVA = 0.1; // IVA de hostelería en España; el back cobra lo mismo

const DetalledelaCompra = () => {
  const carrito = useSelector((state) => state.carrito);
  const fechaEntrada = JSON.parse(localStorage.getItem("fecha_entrada"));
  const fechaSalida = JSON.parse(localStorage.getItem("fecha_salida"));
  // Convierte las cadenas a objetos Date
  const fecha_entrada = new Date(localStorage.getItem("fecha_entrada"));
  const fecha_salida = new Date(localStorage.getItem("fecha_salida"));
  // Realiza la resta
  const estadiaEnMilisegundos = fecha_salida - fecha_entrada;
  // Convierte la diferencia a días
  const estadia = estadiaEnMilisegundos / (24 * 60 * 60 * 1000);
  const subtotal = carrito.reduce(
    (total, producto) => total + producto.precio * estadia,
    0
  );
  const usuarioId = JSON.parse(localStorage.getItem("userId"));
  const iva = subtotal * IVA;
  const total = subtotal + iva;
  const [cargando, setCargando] = useState(false);

  // El back arma la sesión de Stripe Checkout con los precios de la DB y nos da la URL de pago
  const handlePagar = async () => {
    setCargando(true);
    try {
      const { data } = await axios.post("/checkout/session", {
        userId: usuarioId,
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
      });
      window.location.href = data.url;
    } catch (error) {
      setCargando(false);
      Swal.fire({
        title: error.response?.data?.error || "No se pudo iniciar el pago",
        icon: "error",
        confirmButtonColor: "#FB350C",
      });
    }
  };

  return (
    <div className="m-4 lg:w-1/3 py-6 text text-negro bg-verde rounded-md ">
      <div className="mx-12 mt-16">
        <p className="text-3xl text-inter text-blanco font-bold text-center mb-28">
          TOTAL DE LA COMPRA
        </p>
        <div className="border-b-2 border-blanco text-inter text-blanco text-xl flex mb-8">
          <div className="w-1/2">
            <h2>Subtotal</h2>
          </div>
          <div className="w-1/2 text-end mb-2">
            <h2>
              {subtotal.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
              })}
            </h2>
          </div>
        </div>
        <div className="border-b-2 border-blanco text-inter text-blanco text-xl flex mb-8">
          <div className="w-1/2">
            <h2>IVA 10%</h2>
          </div>
          <div className="w-1/2 text-end mb-2">
            <h2>
              {iva.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
              })}
            </h2>
          </div>
        </div>
        <div className="flex mb-4 text-inter text-blanco font-bold text-2xl">
          <div className="w-1/2">
            <h2>Total</h2>
          </div>
          <div className="w-1/2 text-end">
            <h2>
              {total.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
              })}
            </h2>
          </div>
        </div>
        <button
          className="w-full bg-naranja text-blanco py-2 px-4 rounded-md mt-4 disabled:opacity-50"
          onClick={handlePagar}
          disabled={cargando || !total}
        >
          {cargando ? "Redirigiendo a Stripe..." : "Pagar con tarjeta"}
        </button>
      </div>
    </div>
  );
};

export default DetalledelaCompra;
