import express from 'express';
import fs from 'fs';

const app = express();
app.use(express.json());

const FILE_PATH = './tareas.json';

let tareas = [];
if (fs.existsSync(FILE_PATH)) {
  const data = fs.readFileSync(FILE_PATH, 'utf-8');
  try {
    tareas = JSON.parse(data) || [];
  } catch {
    tareas = [];
  }
} else {
  fs.writeFileSync(FILE_PATH, '[]');
}

const guardarTareas = () => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(tareas, null, 2));
};


app.post('/tareas', (req, res) => {
  const { nombre, descripcion, estado } = req.body;

  if (!nombre || !descripcion) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios (nombre, descripcion)' });
  }

  const existe = tareas.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe) {
    return res.status(400).json({ mensaje: 'Ya existe una tarea con ese nombre' });
  }

  const nuevaTarea = {
    nombre,
    descripcion,
    estado: estado?.toUpperCase() === 'COMPLETADO' ? 'COMPLETADO' : 'PENDIENTE'
  };

  tareas.push(nuevaTarea);
  guardarTareas();
  res.status(201).json({ mensaje: 'Tarea creada exitosamente', tarea: nuevaTarea });
});


app.get('/tareas', (req, res) => {
  res.json(tareas);
});


app.get('/tareas/:nombre', (req, res) => {
  const { nombre } = req.params;
  const tarea = tareas.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (!tarea) {
    return res.status(404).json({ mensaje: 'Tarea no encontrada' });
  }
  res.json(tarea);
});


app.put('/tareas/:nombre', (req, res) => {
  const { nombre } = req.params;
  const { descripcion, estado } = req.body;

  const tarea = tareas.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (!tarea) {
    return res.status(404).json({ mensaje: 'Tarea no encontrada' });
  }

  if (descripcion) tarea.descripcion = descripcion;
  if (estado) tarea.estado = estado.toUpperCase() === 'COMPLETADO' ? 'COMPLETADO' : 'PENDIENTE';

  guardarTareas();
  res.json({ mensaje: 'Tarea modificada correctamente', tarea });
});

app.delete('/tareas/:nombre', (req, res) => {
  const { nombre } = req.params;
  const index = tareas.findIndex(t => t.nombre.toLowerCase() === nombre.toLowerCase());

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Tarea no encontrada' });
  }

  tareas.splice(index, 1);
  guardarTareas();
  res.json({ mensaje: 'Tarea eliminada correctamente' });
});


app.patch('/tareas/:nombre/estado', (req, res) => {
  const { nombre } = req.params;
  const { estado } = req.body;

  const tarea = tareas.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (!tarea) {
    return res.status(404).json({ mensaje: 'Tarea no encontrada' });
  }

  if (!estado || (estado.toUpperCase() !== 'PENDIENTE' && estado.toUpperCase() !== 'COMPLETADO')) {
    return res.status(400).json({ mensaje: 'Estado inválido, use PENDIENTE o COMPLETADO' });
  }

  tarea.estado = estado.toUpperCase();
  guardarTareas();
  res.json({ mensaje: 'Estado actualizado correctamente', tarea });
});


app.get('/tareas/estado/:estado', (req, res) => {
  const { estado } = req.params;
  const estadoMayus = estado.toUpperCase();

  if (estadoMayus !== 'PENDIENTE' && estadoMayus !== 'COMPLETADO') {
    return res.status(400).json({ mensaje: 'Estado inválido, use PENDIENTE o COMPLETADO' });
  }

  const filtradas = tareas.filter(t => t.estado === estadoMayus);
  res.json(filtradas);
});


app.listen(3000, () => {
  console.log('✅ Servidor escuchando en el puerto 3000');
});
