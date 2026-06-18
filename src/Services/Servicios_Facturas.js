const fs = require('fs').promises;
const path = require('path');
const { getVideojuegos, updateVideojuego, getVideojuegoByTitulo } = require('./Servicios_Videojuegos');
const dataDir = path.join(__dirname, '..', 'Data');
const facturasFile = path.join(dataDir, 'DataFacturas.json');//en estas primeras 5 lineas importo los módulos necesarios y defino la ruta al archivo JSON donde se almacenarán las facturas. 
// También importo funciones del servicio de videojuegos para poder verificar y actualizar el stock de los juegos cuando se creen o modifiquen facturas.

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

async function createFactura(facturaData) {
  const facturas = await getFacturas();
  let randomNum;//permite generar un número de factura aleatorio
  let exists = true;
  while (exists) {
    randomNum = Math.floor(Math.random() * 1000) + 1;
    exists = facturas.some(f => f.Numero_Factura === randomNum);
  }
  const juegosNombresRaw = facturaData.juegos || facturaData.lista_de_juegos || facturaData['lista de juegos'] || [];
  const juegosNombres = Array.isArray(juegosNombresRaw)
    ? juegosNombresRaw
    : typeof juegosNombresRaw === 'string'
    ? juegosNombresRaw.split(',').map(nombre => nombre.trim()).filter(Boolean)
    : [];

  if (juegosNombres.length > 0) {
    const videojuegos = await getVideojuegos();
    const invalidos = juegosNombres.filter(nombre => !videojuegos.some(v => v.titulo === nombre));//aca verifico que los juegos ingresados existan
    if (invalidos.length > 0) {
      const error = new Error(`Juego(s) no encontrado(s): ${invalidos.join(', ')}`);
      error.status = 400;
      throw error;
    }

    // Restar 1 de stock para cada juego en la factura
    for (const nombreJuego of juegosNombres) {
      const videojuego = await getVideojuegoByTitulo(nombreJuego);
      if (videojuego) {
        const nuevoStock = Math.max(0, videojuego.stock - 1); // No permitir stock negativo
        await updateVideojuego(videojuego.id, { ...videojuego, stock: nuevoStock });
      }
    }
  }
  
  const baseFactura = { ...facturaData };//aca creo una copia del objeto facturaData
  //para evitar modificar el objeto original al eliminar las propiedades de juegos
  //
  delete baseFactura.juegos;
  delete baseFactura.lista_de_juegos;
  delete baseFactura['lista de juegos'];
  delete baseFactura['Lista de juegos'];

  const nuevaFactura = { Numero_Factura: randomNum, ...baseFactura, 'Lista de juegos': juegosNombres.join(', ') };
  facturas.push(nuevaFactura);
  await saveFacturas(facturas);
  return nuevaFactura;
}

async function updateFactura(id, facturaData) {
  const facturas = await getFacturas();
  const index = facturas.findIndex(f => f.Numero_Factura === id);
  if (index < 0) return null;

  // obtengo los juegos
  const juegosAntiguosRaw = facturas[index]['Lista de juegos'] || '';
  const juegosAntiguos = juegosAntiguosRaw
    ? juegosAntiguosRaw.split(',').map(nombre => nombre.trim()).filter(Boolean)
    : [];

  const juegosNombresRaw = facturaData.juegos || facturaData.lista_de_juegos || facturaData['lista de juegos'];
  const juegosNuevos = Array.isArray(juegosNombresRaw)
    ? juegosNombresRaw
    : typeof juegosNombresRaw === 'string'
    ? juegosNombresRaw.split(',').map(nombre => nombre.trim()).filter(Boolean)
    : [];

  if (juegosNuevos.length > 0) {
    const videojuegos = await getVideojuegos();
    const invalidos = juegosNuevos.filter(nombre => !videojuegos.some(v => v.titulo === nombre));
    if (invalidos.length > 0) {
      const error = new Error(`Juego(s) no encontrado(s): ${invalidos.join(', ')}`);
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

async function deleteFactura(id) {
  const facturas = await getFacturas();
  const index = facturas.findIndex(f => f.Numero_Factura === id);
  if (index < 0) return false;

  // Restaurar stock de los juegos que estaban en la factura
  const juegosRaw = facturas[index]['Lista de juegos'] || '';
  const juegos = juegosRaw
    ? juegosRaw.split(',').map(nombre => nombre.trim()).filter(Boolean)
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
