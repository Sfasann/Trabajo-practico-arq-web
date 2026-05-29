// --- DATA SEED (Datos por defecto en memoria) ---
let videojuegos = [
    { id: 1, titulo: "Elden Ring", plataforma: "PS5", genero: "RPG", precio: 60, stock: 15 },
    { id: 2, titulo: "The Legend of Zelda: TotK", plataforma: "Nintendo Switch", genero: "Aventura", precio: 70, stock: 8 },
    { id: 3, titulo: "FIFA 26", plataforma: "Xbox Series X", genero: "Deportes", precio: 70, stock: 25 },
    { id: 4, titulo: "Cyberpunk 2077", plataforma: "PC", genero: "RPG", precio: 40, stock: 10 },
    { id: 5, titulo: "Spider-Man 2", plataforma: "PS5", genero: "Accion", precio: 70, stock: 5 }
];

// Obtener todos los Videojuego (GET)
const obtenerVideojuegos = (req, res) => {
    res.status(200).json(videojuegos);
};
// Crear un nuevo Videojuego (POST)
const CrearVideojuego = (req, res) => {
    const { titulo, plataforma, genero, precio, stock } = req.body;
    const nuevoVideojuego = { id: videojuegos.length + 1, titulo, plataforma, genero, precio, stock };
    videojuegos.push(nuevoVideojuego);
    res.status(201).json(nuevoVideojuego);
};
// Actualizar un Videojuego (PUT)
const actualizarVideojuego = (req, res) => {
    const id = parseInt(req.params.id);
    const { titulo, plataforma, genero, precio, stock } = req.body;
    const videojuegoIndex = videojuegos.findIndex(v => v.id === id);
    if (videojuegoIndex < 0) {
        return res.status(404).json({ message: "Videojuego no encontrado" });
    }
    videojuegos[videojuegoIndex] = { ...videojuegos[videojuegoIndex], titulo, plataforma, genero, precio, stock };
    res.status(200).json(videojuegos[videojuegoIndex]);
}; 
// Eliminar un Videojuego (DELETE)
const eliminarVideojuego = (req, res) => {
    const id = parseInt(req.params.id);
    const videojuegoIndex = videojuegos.findIndex(v => v.id === id);
    if (videojuegoIndex < 0) {
        return res.status(404).json({ message: "Videojuego no encontrado" });
    }
    videojuegos.splice(videojuegoIndex, 1);
    res.status(200).json({ message: "Videojuego eliminado" });
};

// Exportamos las funciones para que las puedan usar las rutas
module.exports = {
    obtenerVideojuegos,
    CrearVideojuego,
    actualizarVideojuego,
    eliminarVideojuego
};