import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const MENSAJES = {
  confirmando: "Estamos confirmando tu pago...",
  pagado: "Tu pago con tarjeta se ha procesado correctamente y tu reserva está confirmada.",
  noPagado: "Todavía no hemos recibido la confirmación del pago. Revisa tus reservas en unos minutos.",
};

const PagoExitoso = () => {
  const [searchParams] = useSearchParams();
  const [estado, setEstado] = useState("confirmando");

  // Stripe vuelve con ?session_id=...; el back verifica con Stripe que esté pagada y crea la reserva
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return setEstado("noPagado");
    axios
      .post("/checkout/confirmar", { sessionId })
      .then(({ data }) => {
        setEstado(data.pagado ? "pagado" : "noPagado");
        if (data.pagado) {
          localStorage.removeItem("fecha_entrada");
          localStorage.removeItem("fecha_salida");
        }
      })
      .catch(() => setEstado("noPagado"));
  }, [searchParams]);

  return (
    <div
      className="flex items-center justify-center bg-cover bg-center text-white text-center p-8 h-screen"
      style={{
        backgroundImage:
          'url("https://i.postimg.cc/3xxjwxft/selena-hotel-1.png")',
      }}
    >
      <div className="flex flex-col items-center lg:h-auto bg-blanco lg:w-2/3 rounded-lg px-4 pt-3 py-20">
        <a
          href="/"
          className=" font-inter text-base antialiased font-bold text-naranja text-inter hover:scale-105 md:w-1/6 mt-6 pl-4 md:pl-0 mr-auto "
        >
          🡰 Volver
        </a>
        <p className="flex font-inter text-4xl antialiased leading-normal text-center font-bold text-naranja justify-center mt-6 mb-10 lg:mb-20">
          ¡Gracias por Elegir Serena Hotel!
        </p>

        <p className="flex font-inter text-xl antialiased leading-normal text-center font-bold text-gris justify-center mb-8 lg:mb-16">
          {MENSAJES[estado]}
        </p>
        <a
          href="/clienteReservas"
          className="lg:w-2/4 mb-4 select-none rounded-lg bg-naranja py-3.5 px-7 text-center align-middle font-inter text-base font-bold uppercase text-blanco transition-all focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none border-2 border-naranja hover:border-blanco"
        >
          Tus Reservas
        </a>
      </div>
    </div>
  );
};

export default PagoExitoso;
