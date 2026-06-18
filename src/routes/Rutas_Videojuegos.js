const express = require('express');//const define a una variable cuyo valor no puede ser reasignado
const router = express.Router();
const Controllers_Videojuegos = require('../Controllers/Controllers_Videojuegos');

// Defino las ruta usando el controlador
router.get('/', Controllers_Videojuegos.obtenerVideojuegos);
router.get('/:id', Controllers_Videojuegos.obtenerVideojuegosPorId);
router.post('/', Controllers_Videojuegos.CrearVideojuego);
router.put('/:id', Controllers_Videojuegos.actualizarVideojuego);
router.delete('/:id', Controllers_Videojuegos.eliminarVideojuego);
module.exports = router;