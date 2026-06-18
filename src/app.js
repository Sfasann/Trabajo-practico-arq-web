const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'Frontend')));
// --- CONEXIÓN DE RUTAS ---
//Crea las rutas para videojuegos y facturas
const videojuegosRoutes = require('./Routes/Rutas_Videojuegos');
app.use('/api/videojuegos', videojuegosRoutes);
const facturasRoutes = require('./Routes/Rutas_Facturas');
app.use('/api/facturas', facturasRoutes);

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
    res.send('Servidor de PixelVault Games funcionando con éxito 🎮');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});