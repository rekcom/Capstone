const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../users.json');

// Configuración de multer para guardar archivos en /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// -------------------- SUBIR PLANO --------------------
router.post('/upload', upload.single('plano'), (req, res) => {
  const username = req.body.username;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'No se subió ningún archivo' });

  // Leer usuarios
  const users = JSON.parse(fs.readFileSync(dbPath));

  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

  // Guardar plano en el usuario
  if (!user.planos) user.planos = [];
  user.planos.push(file.filename);
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));

  res.json({ message: 'Plano subido correctamente', filename: req.file.filename });

});

// -------------------- LISTAR PLANOS --------------------
router.get('/list/:username', (req, res) => {
  const username = req.params.username;

  const users = JSON.parse(fs.readFileSync(dbPath));
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

  res.json({ planos: user.planos || [] });
});

module.exports = router;
