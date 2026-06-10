const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'horarios',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;
// Intenta crear el pool, pero NO termina el proceso si falla la conexión.
(async function init() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Conectado a la DB (pool creado)');
  } catch (err) {
    console.error('Error creando pool de DB:', err.message);
    pool = null; // dejamos el servidor arriba y devolvemos 503 en las rutas que lo requieran
  }
})();

app.post('/api/schedules', async (req, res) => {
  const { inicio, fin, days } = req.body || {};
  if (!inicio || !fin || !Array.isArray(days) || days.length === 0) {
    return res.status(400).json({ success: false, message: 'Faltan datos: inicio, fin o days' });
  }

  const dias = days.join(', ');

  try {
    if (!pool) {
      return res.status(503).json({ success: false, message: 'Base de datos no disponible' });
    }
    const sql = 'INSERT INTO horarios (hora_inicio, hora_fin, dias, fecha_creacion) VALUES (?, ?, ?, NOW())';
    const [result] = await pool.execute(sql, [inicio, fin, dias]);
    return res.json({ success: true, message: 'Horario guardado', id: result.insertId });
  } catch (err) {
    console.error('Error al insertar en DB:', err.message);
    return res.status(500).json({ success: false, message: 'Error al guardar en la base de datos.' });
  }
});

// Ruta de salud simple
app.get('/api/health', (req, res) => {
  if (pool) return res.json({ healthy: true });
  return res.status(503).json({ healthy: false, message: 'DB not connected' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
