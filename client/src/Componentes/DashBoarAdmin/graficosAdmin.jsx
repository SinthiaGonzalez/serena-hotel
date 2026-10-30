import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getHabitaciones, getReservas_Admin } from "../../redux/Actions/actions";
import { useVerificarIsAdmin } from "../AutenticadorToken/autenticadorLocalStIsAdmin";

const euros = (n) =>
  n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const Tarjeta = ({ titulo, valor }) => (
  <div className="bg-verde rounded-md p-6 text-center flex-1">
    <p className="text-sm uppercase tracking-wide text-grisblanco">{titulo}</p>
    <p className="text-3xl font-bold mt-2">{valor}</p>
  </div>
);

const GraficosAdmin = () => {
  useVerificarIsAdmin();
  const dispatch = useDispatch();
  const reservas = useSelector((state) => state.reservasTodasAdmin);
  const habitaciones = useSelector((state) => state.habitaciones);

  useEffect(() => {
    dispatch(getReservas_Admin());
    dispatch(getHabitaciones());
  }, [dispatch]);

  // Ingresos por habitación, de mayor a menor; las que no tienen reservas salen a 0 €
  const porHabitacion = {};
  habitaciones.forEach(({ nombre }) => (porHabitacion[nombre] = 0));
  reservas.forEach(({ nombre_habitacion, precio }) => {
    porHabitacion[nombre_habitacion] = (porHabitacion[nombre_habitacion] || 0) + precio;
  });
  const filas = Object.entries(porHabitacion).sort((a, b) => b[1] - a[1]);

  const total = filas.reduce((suma, [, importe]) => suma + importe, 0);
  const totalReservas = new Set(reservas.map((r) => r.id_reserva)).size;
  const totalNoches = reservas.reduce((suma, r) => suma + (r.noches || 0), 0);

  return (
    <div className="text-white p-8 xl:mx-28 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Tarjeta titulo="Ingresos (sin IVA)" valor={euros(total)} />
        <Tarjeta titulo="Reservas" valor={totalReservas} />
        <Tarjeta titulo="Noches vendidas" valor={totalNoches} />
      </div>

      <div className="bg-verde p-8 rounded-md">
        <h2 className="text-2xl font-bold mb-6">Ingresos por habitación</h2>
        {filas.length === 0 ? (
          <p className="text-grisblanco">Todavía no hay reservas.</p>
        ) : (
          <div style={{ height: `${filas.length * 48 + 40}px` }}>
            <Bar
              data={{
                labels: filas.map(([nombre]) => nombre),
                datasets: [
                  {
                    data: filas.map(([, importe]) => importe),
                    backgroundColor: "#FF3D00",
                    borderRadius: 4,
                    barThickness: 24,
                  },
                ],
              }}
              options={{
                indexAxis: "y",
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (ctx) => euros(ctx.parsed.x) } },
                },
                scales: {
                  x: {
                    ticks: { color: "#D9D9D9", callback: (v) => euros(v) },
                    grid: { color: "rgba(255,255,255,0.08)" },
                  },
                  y: { ticks: { color: "#FFFFFF" }, grid: { display: false } },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default GraficosAdmin;
