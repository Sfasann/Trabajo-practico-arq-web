const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para entender JSON
app.use(express.json());

// --- CONEXIÓN DE RUTAS ---
// Le decimos a Express que todas las rutas de videojuegos van a colgar de '/api/videojuegos'
const videojuegosRoutes = require('./Routes/Rutas_Videojuegos');
app.use('/api/videojuegos', videojuegosRoutes);

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
    res.send('Servidor de PixelVault Games funcionando con éxito 🎮');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});