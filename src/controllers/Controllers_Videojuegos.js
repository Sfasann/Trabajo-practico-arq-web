
const {
  getVideojuegos,
  getVideojuegoById,
  createVideojuego,
  updateVideojuego,
  deleteVideojuego
} = require('../Services/Servicios_Videojuegos');//aca importo las funciones del servicio para usarlas en el controlador

// Obtener todos los Videojuegos (GET)
const obtenerVideojuegos = async (req, res) => {
  try {
    const videojuegos = await getVideojuegos();
    res.status(200).json(videojuegos); 
  } catch (error) {
    res.status(500).json({ message: 'Error al leer los videojuegos', error: error.message });
  }
};
const obtenerVideojuegosPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const videojuego = await getVideojuegoById(id);
    if (!videojuego) {
      return res.status(404).json({ message: 'Videojuego no encontrado' });
    }
    res.status(200).json(videojuego);
  } catch (error) {
    res.status(500).json({ message: 'Error al leer el videojuego', error: error.message });
  }
};
// Crear un nuevo Videojuego (POST)
const CrearVideojuego = async (req, res) => {
  try {
    const { titulo, plataforma, genero, precio, stock } = req.body;
    if (!titulo || !plataforma || !genero || precio === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const nuevoVideojuego = await createVideojuego({ titulo, plataforma, genero, precio, stock });
    res.status(201).json(nuevoVideojuego);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el videojuego', error: error.message });
  }
};

// Actualizar un Videojuego (PUT)
const actualizarVideojuego = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { titulo, plataforma, genero, precio, stock } = req.body;
    if (!titulo || !plataforma || !genero || precio === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const videojuegoActualizado = await updateVideojuego(id, { titulo, plataforma, genero, precio, stock });

    if (!videojuegoActualizado) {
      return res.status(404).json({ message: 'Videojuego no encontrado' });
    }

    res.status(200).json(videojuegoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el videojuego', error: error.message });
  }
};

// Eliminar un Videojuego (DELETE)
const eliminarVideojuego = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const eliminado = await deleteVideojuego(id);

    if (!eliminado) {
      return res.status(404).json({ message: 'Videojuego no encontrado' });
    }

    res.status(200).json({ message: 'Videojuego eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el videojuego', error: error.message });
  }
};

module.exports = {
  obtenerVideojuegos,
  obtenerVideojuegosPorId,
  CrearVideojuego,
  actualizarVideojuego,
  eliminarVideojuego
};