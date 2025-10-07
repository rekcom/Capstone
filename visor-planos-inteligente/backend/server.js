const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const planosRoutes = require('./routes/planos');

const app = express();

// Carpeta de archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Carpeta de archivos subidos (uploads)
// server.js
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use('/auth', authRoutes);
app.use('/planos', planosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
