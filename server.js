const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const ARCHIVO_TAREAS = "tareas.json";
const ARCHIVO_USUARIOS = "usuarios.json";
const SECRET_KEY = "fullstack2026";

// Middleware de autenticación

const verificarToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            mensaje: "Acceso denegado. Token requerido."
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const usuario = jwt.verify(
            token,
            SECRET_KEY
        );

        req.usuario = usuario;

        next();

    } catch {

        res.status(403).json({
            mensaje: "Token inválido"
        });

    }

};

// Ruta principal
app.get("/", (req, res) => {
    res.json({
        mensaje: "API de tareas funcionando correctamente"
    });
});

// Registrar usuario
app.post("/register", async (req, res) => {
    try {

        const { usuario, password } = req.body;

        const data = await fs.readFile(
            ARCHIVO_USUARIOS,
            "utf8"
        );

        const usuarios = JSON.parse(data);

        const existe = usuarios.find(
            u => u.usuario === usuario
        );

        if (existe) {
            return res.status(400).json({
                mensaje: "El usuario ya existe"
            });
        }

        const passwordEncriptada =
            await bcrypt.hash(password, 10);

        const nuevoUsuario = {
            id: usuarios.length + 1,
            usuario,
            password: passwordEncriptada
        };

        usuarios.push(nuevoUsuario);

        await fs.writeFile(
            ARCHIVO_USUARIOS,
            JSON.stringify(usuarios, null, 2)
        );

        res.status(201).json({
            mensaje: "Usuario registrado correctamente"
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al registrar usuario"
        });
    }
});

// Obtener tareas
app.get("/tareas", verificarToken, async (req, res) => {
    try {
        const data = await fs.readFile(
            ARCHIVO_TAREAS,
            "utf8"
        );

        const tareas = JSON.parse(data);

        res.json(tareas);

    } catch {
        res.status(500).json({
            mensaje: "Error al leer tareas"
        });
    }
});

// Crear tarea
app.post("/tareas", verificarToken, async (req, res) => {
    try {

        const { titulo, descripcion } = req.body;

        const data = await fs.readFile(
            ARCHIVO_TAREAS,
            "utf8"
        );

        const tareas = JSON.parse(data);

        const nuevaTarea = {
            id: tareas.length + 1,
            titulo,
            descripcion
        };

        tareas.push(nuevaTarea);

        await fs.writeFile(
            ARCHIVO_TAREAS,
            JSON.stringify(tareas, null, 2)
        );

        res.status(201).json(nuevaTarea);

    } catch {
        res.status(500).json({
            mensaje: "Error al crear tarea"
        });
    }
});

// Actualizar tarea
app.put("/tareas/:id", verificarToken, async (req, res) => {
    try {

        const id =
            parseInt(req.params.id);

        const {
            titulo,
            descripcion
        } = req.body;

        const data = await fs.readFile(
            ARCHIVO_TAREAS,
            "utf8"
        );

        const tareas = JSON.parse(data);

        const indice =
            tareas.findIndex(
                tarea => tarea.id === id
            );

        if (indice === -1) {
            return res.status(404).json({
                mensaje: "Tarea no encontrada"
            });
        }

        tareas[indice] = {
            id,
            titulo,
            descripcion
        };

        await fs.writeFile(
            ARCHIVO_TAREAS,
            JSON.stringify(tareas, null, 2)
        );

        res.json(tareas[indice]);

    } catch {
        res.status(500).json({
            mensaje: "Error al actualizar tarea"
        });
    }
});

// Eliminar tarea
app.delete("/tareas/:id", verificarToken, async (req, res) => {
    try {

        const id =
            parseInt(req.params.id);

        const data = await fs.readFile(
            ARCHIVO_TAREAS,
            "utf8"
        );

        const tareas = JSON.parse(data);

        const nuevasTareas =
            tareas.filter(
                tarea => tarea.id !== id
            );

        await fs.writeFile(
            ARCHIVO_TAREAS,
            JSON.stringify(
                nuevasTareas,
                null,
                2
            )
        );

        res.json({
            mensaje:
                "Tarea eliminada correctamente"
        });

    } catch {
        res.status(500).json({
            mensaje: "Error al eliminar tarea"
        });
    }
});

// Login
app.post("/login", async (req, res) => {

    try {

        const { usuario, password } = req.body;

        const data = await fs.readFile(
            ARCHIVO_USUARIOS,
            "utf8"
        );

        const usuarios = JSON.parse(data);

        const usuarioEncontrado =
            usuarios.find(
                u => u.usuario === usuario
            );

        if (!usuarioEncontrado) {
            return res.status(401).json({
                mensaje: "Usuario no encontrado"
            });
        }

        const coincide =
            await bcrypt.compare(
                password,
                usuarioEncontrado.password
            );

        if (!coincide) {
            return res.status(401).json({
                mensaje: "Contraseña incorrecta"
            });
        }

        const token = jwt.sign(
            {
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario
            },
            SECRET_KEY,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            mensaje: "Login exitoso",
            token
        });

    } catch (error) {

        res.status(500).json({
            mensaje: "Error al iniciar sesión"
        });

    }

});

// Error 404

app.use((req, res) => {
    res.status(404).json({
        mensaje: "Ruta no encontrada"
    });
});

// Error 500

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        mensaje: "Error interno del servidor"
    });

});

app.listen(PORT, () => {
    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );
});