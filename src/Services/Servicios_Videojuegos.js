const fs = require('fs').promises;
const path = require('path');
const dataDir = path.join(__dirname, '..', 'Data');
const videojuegosFile = path.join(dataDir, 'DataVideojuegos.json');


async function ensureDataFile(filePath) {//Primero verifico si el archivo existe
  try {
    await fs.access(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf8');
    } else {
      throw error;
    }
  }
}

async function readJson(filePath) {//Si existe el archivo, lo leo y lo parseo a un objeto JS. 
  await ensureDataFile(filePath);
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content || '[]');
}

async function writeJson(filePath, data) {//Si quiero escribir en el archivo, primero convierto el objeto JS a una cadena JSON y luego la escribo en el archivo.
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, content, 'utf8');
}

async function getVideojuegos() {//Si quiero obtener los videojuegos, simplemente leo el archivo JSON y lo devuelvo como un objeto JS.
  return await readJson(videojuegosFile);
}

async function saveVideojuegos(videojuegos) {//Si quiero guardar los videojuegos, convierto el objeto JS a una cadena JSON y lo escribo en el archivo.
  await writeJson(videojuegosFile, videojuegos);
}

async function createVideojuego(videojuegoData) { 
  const videojuegos = await getVideojuegos();
  let randomId;
  let idExists = true;
  
  while (idExists) {
    randomId = Math.floor(Math.random() * 1000) + 1;
    idExists = videojuegos.some(v => v.id === randomId);
  }
  const nuevoVideojuego = { id: randomId, ...videojuegoData };
  videojuegos.push(nuevoVideojuego);
  await saveVideojuegos(videojuegos);
  return nuevoVideojuego;
}

async function updateVideojuego(id, videojuegoData) {
  const videojuegos = await getVideojuegos();
  const index = videojuegos.findIndex(v => v.id === id);
  if (index < 0) {
    return null;
  }
  videojuegos[index] = { ...videojuegos[index], ...videojuegoData, id };
  await saveVideojuegos(videojuegos);
  return videojuegos[index];
}

async function deleteVideojuego(id) {
  const videojuegos = await getVideojuegos();
  const index = videojuegos.findIndex(v => v.id === id);
  if (index < 0) {
    return false;
  }
  videojuegos.splice(index, 1);
  await saveVideojuegos(videojuegos);
  return true;
}

async function getVideojuegoByTitulo(titulo) {
  const videojuegos = await getVideojuegos();
  return videojuegos.find(v => v.titulo === titulo) || null;
}

module.exports = {
  getVideojuegos,
  createVideojuego,
  updateVideojuego,
  deleteVideojuego,
  getVideojuegoByTitulo,
  saveVideojuegos,
};

