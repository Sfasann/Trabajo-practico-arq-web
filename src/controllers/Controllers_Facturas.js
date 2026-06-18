const {
  getFacturas,
  createFactura,
  updateFactura,
  deleteFactura
} = require('../Services/Servicios_Facturas');//aca importo las funciones del servicio para usarlas en el controlador

//defino las funciones para GET y GET por ID
const obtenerFacturas = async (req, res) => {
  try {
    const facturas = await getFacturas();
    res.status(200).json(facturas); 
  } catch (error) {
    res.status(500).json({ message: 'Error al leer las facturas', error: error.message });
  }
};
const obtenerFacturaPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const facturas = await getFacturas();
    const factura = facturas.find(f => f.Numero_Factura === id);
    if (!factura) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    res.status(200).json(factura);
  } catch (error) {
    res.status(500).json({ message: 'Error al leer la factura', error: error.message });
  }
};
//Defino la función para POST
const crearFactura = async (req, res) => {
  try {
    const { Fecha, Nombre_Cliente, Suma_total, juegos, lista_de_juegos, 'lista de juegos': listaDeJuegos } = req.body;// aca defino que campos espero recibir en el body
    
    // Validar campos obligatorios
    if (!Fecha || !Nombre_Cliente || Suma_total === undefined) {
      return res.status(400).json({ message: 'Faltan campos obligatorios o ingreso mal el nombre de un juego' });
    }
    
    // Validar que se envíe al menos un juego
    const juegosData = juegos || lista_de_juegos || listaDeJuegos;
    if (!juegosData || (Array.isArray(juegosData) && juegosData.length === 0) || (typeof juegosData === 'string' && juegosData.trim() === '')) {
      return res.status(400).json({ message: 'Debe incluir al menos un juego.' });
    }
    const nuevaFactura = await createFactura(req.body);
    res.status(201).json(nuevaFactura);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error al crear la factura', error: error.message });
  }
};
//Defino la función para PUT
const actualizarFactura = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { Fecha, Nombre_Cliente, Suma_total, juegos, lista_de_juegos, 'lista de juegos': listaDeJuegos } = req.body;
    
    // Validar campos obligatorios si se envían
    if (Fecha === '' || Nombre_Cliente === '' || (Suma_total !== undefined && Suma_total === '')) {
      return res.status(400).json({ message: 'Los campos no pueden estar vacíos' });
    }
    
    // Si se envían juegos, validar que no estén vacíos
    const juegosData = juegos || lista_de_juegos || listaDeJuegos;
    if (juegosData !== undefined && ((Array.isArray(juegosData) && juegosData.length === 0) || (typeof juegosData === 'string' && juegosData.trim() === ''))) {
      return res.status(400).json({ message: 'Si especifica juegos, debe incluir al menos uno' });
    }
    
    const facturaActualizada = await updateFactura(id, req.body);
    if (!facturaActualizada) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    res.status(200).json(facturaActualizada);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Error al actualizar la factura', error: error.message });
  }
};
//Defino la función para DELETE
const eliminarFactura = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteFactura(id);
    res.status(200).json({ message: 'Factura eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la factura', error: error.message });
  }
};


module.exports = {
	obtenerFacturas,
	obtenerFacturaPorId,
	crearFactura,
	actualizarFactura,
	eliminarFactura
};
