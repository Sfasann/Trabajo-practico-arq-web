const express = require('express');
const router = express.Router();
const Controllers_Videojuegos = require('../controllers/Controllers_Videojuegos');

// Defino las ruta usando el controlador
router.get('/', Controllers_Videojuegos.obtenerVideojuegos);
router.post('/', Controllers_Videojuegos.CrearVideojuego);
router.put('/:id', Controllers_Videojuegos.actualizarVideojuego);
router.delete('/:id', Controllers_Videojuegos.eliminarVideojuego);
module.exports = router;