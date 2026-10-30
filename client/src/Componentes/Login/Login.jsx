/*COMPONENTE PARA LOGUEARSE INGRESANDO VIA BOTON DE GOOGLE (crea usuario sin contraseña)*/
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { postUsuarioGoogle } from "../../redux/Actions/actions";
import { useNavigate } from "react-router-dom";
import { useVerificarToken } from "../AutenticadorToken/autenticadorToken.jsx";
import Swal from "sweetalert2";
export default function LoginTemplate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useVerificarToken();

  const respuestaExitosa = async ({ credential }) => {
    // El back verifica el ID token de Google y crea el usuario si no existe
    await dispatch(postUsuarioGoogle(credential));
    //navigate("/");

    let estado = localStorage.getItem("estado");
    //alert (estado)
    estado = localStorage.getItem("estado");
    if (estado === '"activo"') {
      //alert("linea 31 activo")
      const isAdmin = localStorage.getItem("isAdmin");
      //alert("verificacion 33"+isAdmin+ "estado" + estado)
      if (isAdmin === "true") navigate("/admin-usuarios");
      if (isAdmin === "false") navigate("/");
    } else if (estado === '"eliminar"') {
      Swal.fire({
        title: "Si desea recuperar su cuenta, presione ACEPTAR.",
        icon: "error",
        confirmButtonColor: "#FB350C",
        iconColor: "#FB350C",
      });
      /* LINEA PARA Q SI se CAMBIA A OTRA RUTA NO ESTË LOGUEADO */
      localStorage.removeItem("token");
      navigate("/recuperar-usuario");
    } else if (estado === '"inactivo"') {
      Swal.fire({
        title:
          "Su cuenta se encuentra inactiva, por favor comuníquese con: serenahotel25@gmail.com. Muchas gracias.",
        icon: "error",
        confirmButtonColor: "#FB350C",
        iconColor: "#FB350C",
      });
      /* LINEA PARA Q SI se CAMBIA A OTRA RUTA NO ESTË LOGUEADO */
      localStorage.removeItem("token");
    }
  };

  const respuestaFallida = () => {
    Swal.fire("No se pudo iniciar sesión con Google", "", "error");
  };
  return (
    <div>
      <section>
        <div>
          <GoogleLogin
            text="continue_with"
            locale="es"
            onSuccess={respuestaExitosa}
            onError={respuestaFallida}
          />
        </div>
      </section>
    </div>
  );
}
