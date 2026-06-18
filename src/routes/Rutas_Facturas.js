const express = require('express');//const define a una variable cuyo valor no puede ser reasignado
const router = express.Router();
const Controllers_Facturas = require('../Controllers/Controllers_Facturas');

router.get('/', Controllers_Facturas.obtenerFacturas);
router.get('/:id', Controllers_Facturas.obtenerFacturaPorId);
router.post('/', Controllers_Facturas.crearFactura);
router.put('/:id', Controllers_Facturas.actualizarFactura);
router.delete('/:id', Controllers_Facturas.eliminarFactura);
module.exports = router;