const fs = require('fs').promises;
const path = require('path');
const { getVideojuegos, updateVideojuego, getVideojuegoByTitulo } = require('./Servicios_Videojuegos');
const dataDir = path.join(__dirname, '..', 'Data');
const facturasFile = path.join(dataDir, 'DataFacturas.json');//en estas primeras 5 lineas importo los módulos necesarios y defino la ruta al archivo JSON donde se almacenarán las facturas. 
// También importo funciones del servicio de videojuegos para poder verificar y actualizar el stock de los juegos cuando se creen o modifiquen facturas.

function normalizeTitulo(titulo) {
  return typeof titulo === 'string' ? titulo.trim().toUpperCase() : titulo;
}

function parseListaJuegos(juegosNombresRaw) {
  const nombres = Array.isArray(juegosNombresRaw)
    ? juegosNombresRaw
    : typeof juegosNombresRaw === 'string'
    ? juegosNombresRaw.split(',').map(nombre => nombre.trim()).filter(Boolean)
    : [];
  return nombres.map(normalizeTitulo);
}

async function ensureDataFile(filePath) {
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

async function readJson(filePath) {//lee el archivo JSON y lo parsea a un objeto JS. Si el archivo no existe, lo crea con un array vacío.
  await ensureDataFile(filePath);
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content || '[]');
}

async function writeJson(filePath, data) {//escribe en el archivo JSON. Primero convierte el objeto JS a una cadena JSON y luego la escribe en el archivo.
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, content, 'utf8');
}

async function getFacturas() {//obtiene las facturas leyendo el archivo JSON y devolviéndolo como un objeto JS.
  return await readJson(facturasFile);
}

async function saveFacturas(facturas) {//guarda los cambios en las facturas escribiendo el objeto JS convertido a JSON en el archivo.
  await writeJson(facturasFile, facturas);
}

//Defino la función para crear una factura en el archivo JSON
async function createFactura(facturaData) {
  const facturas = await getFacturas();
  let randomNum;
  let exists = true;
  while (exists) {
    randomNum = Math.floor(Math.random() * 1000) + 1;
    exists = facturas.some(f => f.Numero_Factura === randomNum);
  }
  const juegosNombresRaw = facturaData.juegos || facturaData.lista_de_juegos || facturaData['lista de juegos'] || [];
  const juegosNombres = parseListaJuegos(juegosNombresRaw);

  if (juegosNombres.length > 0) {
    const videojuegos = await getVideojuegos();
    const invalidos = juegosNombres.filter(nombre => !videojuegos.some(v => v.titulo === nombre));
    if (invalidos.length > 0) {
      const error = new Error(`Juego(s) no encontrado(s): ${invalidos.join(', ')}`);
      error.status = 400;
      throw error;
    }

    // Verificar disponibilidad de stock antes de crear la factura
    const sinStock = [];
    for (const nombreJuego of juegosNombres) {
      const videojuego = await getVideojuegoByTitulo(nombreJuego);
      if (videojuego && videojuego.stock <= 0) {
        sinStock.push(nombreJuego);
      }
    }
    if (sinStock.length > 0) {
      const error = new Error(`Juego(s) sin stock: ${sinStock.join(', ')}`);
      error.status = 400;
      throw error;
    }

    // Resta 1 de stock para cada juego en la factura
    for (const nombreJuego of juegosNombres) {
      const videojuego = await getVideojuegoByTitulo(nombreJuego);
      if (videojuego) {
        const nuevoStock = Math.max(0, videojuego.stock - 1); // No permitir stock negativo
        await updateVideojuego(videojuego.id, { ...videojuego, stock: nuevoStock });
      }
    }
  }
  
  const baseFactura = { ...facturaData };
  delete baseFactura.juegos;
  delete baseFactura.lista_de_juegos;
  delete baseFactura['lista de juegos'];
  delete baseFactura['Lista de juegos'];

  const nuevaFactura = { Numero_Factura: randomNum, ...baseFactura, 'Lista de juegos': juegosNombres.join(', ') };
  facturas.push(nuevaFactura);
  await saveFacturas(facturas);
  return nuevaFactura;
}
//Defino la función para actualizar una factura 
async function updateFactura(id, facturaData) {
  const facturas = await getFacturas();
  const index = facturas.findIndex(f => f.Numero_Factura === id);
  if (index < 0) return null;
  const juegosAntiguosRaw = facturas[index]['Lista de juegos'] || '';
  const juegosAntiguos = juegosAntiguosRaw
    ? parseListaJuegos(juegosAntiguosRaw)
    : [];

  const juegosNombresRaw = facturaData.juegos || facturaData.lista_de_juegos || facturaData['lista de juegos'];
  const juegosNuevos = parseListaJuegos(juegosNombresRaw);

  if (juegosNuevos.length > 0) {
    const videojuegos = await getVideojuegos();
    const invalidos = juegosNuevos.filter(nombre => !videojuegos.some(v => v.titulo === nombre));
    if (invalidos.length > 0) {
      const error = new Error(`Juego(s) no encontrado(s): ${invalidos.join(', ')}`);
      error.status = 400;
      throw error;
    }

    // Verifica stock para los juegos que se van a añadir 
    const porAgregar = juegosNuevos.filter(n => !juegosAntiguos.includes(n));
    const sinStockAgregar = [];
    for (const nombreJuego of porAgregar) {
      const videojuego = await getVideojuegoByTitulo(nombreJuego);
      if (videojuego && videojuego.stock <= 0) {
        sinStockAgregar.push(nombreJuego);
      }
    }
    if (sinStockAgregar.length > 0) {
      const error = new Error(`Juego(s) sin stock: ${sinStockAgregar.join(', ')}`);
      error.status = 400;
      throw error;
    }

    // Si se borra la factura porque se equivoco de juego, se restaura la cantidad de stock
    for (const nombreJuego of juegosAntiguos) {
      if (!juegosNuevos.includes(nombreJuego)) {
        const videojuego = await getVideojuegoByTitulo(nombreJuego);
        if (videojuego) {
          await updateVideojuego(videojuego.id, { ...videojuego, stock: videojuego.stock + 1 });
        }
      }
    }

    // Se resta el stock de juegos que se añadieron
    for (const nombreJuego of juegosNuevos) {
      if (!juegosAntiguos.includes(nombreJuego)) {
        const videojuego = await getVideojuegoByTitulo(nombreJuego);
        if (videojuego) {
          const nuevoStock = Math.max(0, videojuego.stock - 1);
          await updateVideojuego(videojuego.id, { ...videojuego, stock: nuevoStock });
        }
      }
    }
    
    facturaData = { ...facturaData, 'Lista de juegos': juegosNuevos.join(', ') };
    delete facturaData.juegos;
    delete facturaData.lista_de_juegos;
    delete facturaData['lista de juegos'];
  }

  facturas[index] = { ...facturas[index], ...facturaData, Numero_Factura: id };
  await saveFacturas(facturas);
  return facturas[index];
}
//Defino la función para eliminar una factura
async function deleteFactura(id) {
  const facturas = await getFacturas();
  const index = facturas.findIndex(f => f.Numero_Factura === id);
  if (index < 0) return false;

  // Restaurar stock de los juegos que estaban en la factura
  const juegosRaw = facturas[index]['Lista de juegos'] || '';
  const juegos = juegosRaw
    ? parseListaJuegos(juegosRaw)
    : [];

  for (const nombreJuego of juegos) {
    const videojuego = await getVideojuegoByTitulo(nombreJuego);
    if (videojuego) {
      await updateVideojuego(videojuego.id, { ...videojuego, stock: videojuego.stock + 1 });
    }
  }

  facturas.splice(index, 1);
  await saveFacturas(facturas);
  return true;
}

module.exports = {
  getFacturas,
  saveFacturas,
  createFactura,
  updateFactura,
  deleteFactura
};
