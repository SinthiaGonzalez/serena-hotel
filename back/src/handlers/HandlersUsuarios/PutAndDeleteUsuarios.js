const { updateUsuario,updateEstadoUsuario } = require("../../Controladores/controllers_Usuaruios/putUsuarios");
const { deleteUsuario } = require("../../Controladores/controllers_Usuaruios/deleteUsuarios");

const putUsuarioHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, apellido, email, telefono, contraseña, imagen } = req.body;
        // Solo un admin puede cambiar el rol
        const isadmin = req.isAdmin ? req.body.isadmin : undefined;
        const respuesta = await updateUsuario(id, name, apellido, email, telefono, contraseña,isadmin,imagen);
        if (respuesta === "No se encontro el usuario" || respuesta === "Ya existe un usuario con ese correo") res.status(400).json(respuesta);
        else res.status(200).json(respuesta);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const deleteUsuarioHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const respuesta = await deleteUsuario(id);
        if (respuesta === "No se encontro el usuario") res.status(400).json(respuesta);
        else res.status(200).json(respuesta);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const putUsuarioEstadoHandler = async (req, res) => {
    try {
        const { id, nuevoEstado } = req.body;
        // Un cliente solo puede dar de baja su cuenta; activar o bloquear es cosa del admin
        if (!req.isAdmin && nuevoEstado !== "eliminar") {
            return res.status(403).json({ message: "Solo para administradores" });
        }
        const respuesta = await updateEstadoUsuario(id, nuevoEstado);
        if (respuesta === "No se encontro el usuario") {
            res.status(400).json(respuesta);
        }else{
          res.status(200).json(respuesta);
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    putUsuarioHandler,
    deleteUsuarioHandler,
    putUsuarioEstadoHandler
};