const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs").promises;

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const ARCHIVO_TAREAS = "tareas.json";

// Ruta principal
app.get("/", (req, res) => {
    res.json({
        mensaje: "API de tareas funcionando correctamente"
    });
});

// Obtener todas las tareas
app.get("/tareas", async (req, res) => {
    try {
        const data = await fs.readFile(ARCHIVO_TAREAS, "utf8");
        const tareas = JSON.parse(data);

        res.json(tareas);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al leer las tareas"
        });
    }
});

// Crear tarea
app.post("/tareas", async (req, res) => {
    try {

        const { titulo, descripcion } = req.body;

        const data = await fs.readFile(ARCHIVO_TAREAS, "utf8");
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

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al crear tarea"
        });
    }
});

// Actualizar tarea
app.put("/tareas/:id", async (req, res) => {
    try {

        const id = parseInt(req.params.id);
        const { titulo, descripcion } = req.body;

        const data = await fs.readFile(ARCHIVO_TAREAS, "utf8");
        const tareas = JSON.parse(data);

        const indice = tareas.findIndex(
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

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al actualizar tarea"
        });
    }
});

// Eliminar tarea
app.delete("/tareas/:id", async (req, res) => {
    try {

        const id = parseInt(req.params.id);

        const data = await fs.readFile(ARCHIVO_TAREAS, "utf8");
        const tareas = JSON.parse(data);

        const nuevasTareas = tareas.filter(
            tarea => tarea.id !== id
        );

        await fs.writeFile(
            ARCHIVO_TAREAS,
            JSON.stringify(nuevasTareas, null, 2)
        );

        res.json({
            mensaje: "Tarea eliminada correctamente"
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al eliminar tarea"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});