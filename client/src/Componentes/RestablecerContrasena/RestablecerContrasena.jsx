import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

// Misma regla que el registro
const CLAVE_SEGURA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const inputClase =
  "w-full h-11 font-inter text-center text-base font-normal text-white bg-verde rounded-lg";

// Página a la que lleva el enlace del correo de recuperación
const RestablecerContrasena = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [contraseña, setContraseña] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const error = !contraseña
    ? ""
    : !CLAVE_SEGURA.test(contraseña)
    ? "Al menos 8 caracteres, con mayúscula, minúscula, dígito y carácter especial"
    : contraseña !== confirmar
    ? "Las contraseñas no coinciden"
    : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error || !contraseña) return;
    try {
      const { data } = await axios.post("/restablecerContrasena", {
        token: params.get("token"),
        contraseña,
      });
      await Swal.fire(data.message, "", "success");
      navigate("/logearse");
    } catch (err) {
      Swal.fire(err.response?.data?.error || "No se pudo cambiar la contraseña", "", "error");
    }
  };

  return (
    <div
      className="flex items-center justify-center bg-cover bg-center text-center p-8 h-screen"
      style={{ backgroundImage: 'url("https://i.postimg.cc/3xxjwxft/selena-hotel-1.png")' }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 text-gris bg-blanco shadow-md rounded-lg p-8 md:w-1/2"
      >
        <h1 className="font-inter text-3xl font-bold">Nueva contraseña</h1>
        <input
          className={inputClase}
          type="password"
          placeholder="Nueva contraseña"
          aria-label="Nueva contraseña"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
        />
        <input
          className={inputClase}
          type="password"
          placeholder="Repetir contraseña"
          aria-label="Repetir contraseña"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />
        {error && <p className="text-base text-naranja">{error}</p>}
        <button
          type="submit"
          disabled={!contraseña || !!error}
          className="rounded-lg bg-naranja py-3.5 px-7 font-inter font-bold uppercase text-blanco disabled:opacity-50"
        >
          Guardar contraseña
        </button>
      </form>
    </div>
  );
};

export default RestablecerContrasena;
