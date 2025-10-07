// URL base del backend
const BASE_URL = 'http://localhost:3000';

// Registro de usuario
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message);
    if (!result.error) window.location.href = 'index.html';
  });
}

// Login de usuario
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (result.error) {
      alert(result.error);
    } else {
      localStorage.setItem('userId', result.userId);
      window.location.href = 'dashboard.html';
    }
  });
}

// Subir plano
const uploadBtn = document.getElementById('uploadBtn');
if (uploadBtn) {
  uploadBtn.addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) return alert('Selecciona un archivo');

    const userId = localStorage.getItem('userId');
    const formData = new FormData();
    formData.append('plano', fileInput.files[0]);

    const res = await fetch(`${BASE_URL}/planos/upload/${userId}`, {
      method: 'POST',
      body: formData
    });

    const result = await res.json();
    alert(result.message);
    if (!result.error) cargarPlanos();
  });

  cargarPlanos();
}

// Listar planos
async function cargarPlanos() {
  const userId = localStorage.getItem('userId');
  const res = await fetch(`${BASE_URL}/planos/${userId}`);
  const planos = await res.json();
  const list = document.getElementById('planosList');
  list.innerHTML = '';
  planos.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.filename;
    list.appendChild(li);
  });
  // Cargar imagen en canvas
function mostrarPlano(filename) {
  const canvas = document.getElementById('planoCanvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = `${BASE_URL}/uploads/${filename}`;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    cargarSimbolos(ctx);
  };
}

async function detectarSimbolos(ctx) {
  const res = await fetch('data/symbols.json');
  const symbols = await res.json();

  const imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imgData.data;

  symbols.forEach(sym => {
    const rgb = hexToRgb(sym.color);
    const posiciones = [];

    // Recorrer todos los píxeles del canvas
    for (let y = 0; y < ctx.canvas.height; y += 5) {
      for (let x = 0; x < ctx.canvas.width; x += 5) {
        const idx = (y * ctx.canvas.width + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2];

        if (r === rgb.r && g === rgb.g && b === rgb.b) {
          posiciones.push({x, y});
        }
      }
    }

    // Dibujar rectángulos sobre los símbolos detectados
    posiciones.forEach(pos => {
      ctx.fillStyle = 'rgba(255,255,0,0.5)';
      ctx.fillRect(pos.x, pos.y, 20, 20);

      ctx.canvas.addEventListener('click', (e) => {
        const rect = ctx.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        if (clickX >= pos.x && clickX <= pos.x + 20 && clickY >= pos.y && clickY <= pos.y + 20) {
          document.getElementById('symbolInfo').textContent = sym.description;
        }
      });
    });
  });
}

// Función auxiliar para convertir HEX a RGB
function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#',''), 16);
  return {r:(bigint>>16)&255, g:(bigint>>8)&255, b:bigint&255};
}


// Cargar el primer plano automáticamente si hay
async function cargarPrimerPlano() {
  const userId = localStorage.getItem('userId');
  const res = await fetch(`${BASE_URL}/planos/${userId}`);
  const planos = await res.json();
  if (planos.length > 0) mostrarPlano(planos[0].filename);
}

cargarPrimerPlano();

}
