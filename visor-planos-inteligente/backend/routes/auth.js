const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Base de datos simple en JSON
const dbPath = path.join(__dirname, '../users.json');

// Crear archivo si no existe
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]));
}

// Registro de usuario
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Debe ingresar usuario y contraseña' });
    }

    const users = JSON.parse(fs.readFileSync(dbPath));

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Usuario ya existe' });
    }

    users.push({ username, password, planos: [] });
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2)); // prettier JSON
    res.status(201).json({ message: 'Usuario registrado correctamente' });
});

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Debe ingresar usuario y contraseña' });
    }

    const users = JSON.parse(fs.readFileSync(dbPath));

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    res.status(200).json({ message: 'Login exitoso', username: user.username });
});

module.exports = router;

