
    const apiEndpoints = {
      videojuegos: '/api/videojuegos',
      facturas: '/api/facturas',
    };

    const moduleSelect = document.getElementById('module-select');
    const operationSelect = document.getElementById('operation-select');
    const operationContainer = document.getElementById('operation-container');
    const messageBox = document.getElementById('message');

    let currentModule = moduleSelect.value;
    let videojuegos = [];
    let facturas = [];
    let selectedItem = null;

    async function init() {
      moduleSelect.addEventListener('change', () => {
        currentModule = moduleSelect.value;
        renderOperationView();
      });
      operationSelect.addEventListener('change', renderOperationView);

      await Promise.all([cargarVideojuegos(), cargarFacturas()]);
      renderOperationView();
    }
//Defino la función para cargar los videojuegos desde el backend
    async function cargarVideojuegos() {
      try {
        const response = await fetch(apiEndpoints.videojuegos);// fetch es una funcion que permite hacer solicitudes HTTP desde el navegador. En este caso, se hace una solicitud GET a la ruta /api/videojuegos 
        if (!response.ok) throw new Error('No se pudo cargar la lista de videojuegos');
        videojuegos = await response.json();
      } catch (error) {
        videojuegos = [];
        mostrarMensaje(error.message, true);
      }
    }
//Defino la función para cargar las facturas desde el backend
    async function cargarFacturas() {
      try {
        const response = await fetch(apiEndpoints.facturas);
        if (!response.ok) throw new Error('No se pudo cargar la lista de facturas');
        facturas = await response.json();
      } catch (error) {
        facturas = [];
        mostrarMensaje(error.message, true);
      }
    }

    function getApiUrl() {
      return apiEndpoints[currentModule];
    }

    function renderOperationView() {
      selectedItem = null;
      messageBox.style.display = 'none';

      if (operationSelect.value === 'carga') {
        renderCargaForm();
      } else {
        renderLista(operationSelect.value);
      }
    }

    function renderCargaForm() {
      if (currentModule === 'facturas') {
        renderCargaFactura();
      } else {
        renderCargaVideojuego();
      }
    }

    function renderCargaVideojuego() {
      operationContainer.innerHTML = `
        <h2>Cargar nuevo videojuego</h2>
        <div class="field-group">
          <div>
            <label for="titulo-input">Título</label>
            <input id="titulo-input" type="text" placeholder="Ej: Zelda" />
          </div>
          <div>
            <label for="plataforma-input">Plataforma</label>
            <input id="plataforma-input" type="text" placeholder="Ej: Nintendo" />
          </div>
          <div>
            <label for="genero-input">Género</label>
            <input id="genero-input" type="text" placeholder="Ej: Aventura" />
          </div>
          <div>
            <label for="precio-input">Precio</label>
            <input id="precio-input" type="number" min="0" step="0.01" placeholder="Ej: 59.99" />
          </div>
          <div>
            <label for="stock-input">Stock</label>
            <input id="stock-input" type="number" min="0" step="1" placeholder="Ej: 10" />
          </div>
        </div>
        <button id="guardar-btn">Guardar videojuego</button>
      `;

      document.getElementById('guardar-btn').addEventListener('click', async () => {
        const nuevoVideojuego = {
          titulo: document.getElementById('titulo-input').value.trim(),
          plataforma: document.getElementById('plataforma-input').value.trim(),
          genero: document.getElementById('genero-input').value.trim(),
          precio: parseFloat(document.getElementById('precio-input').value) || 0,
          stock: parseInt(document.getElementById('stock-input').value, 10) || 0,
        };

        if (!nuevoVideojuego.titulo || !nuevoVideojuego.plataforma || !nuevoVideojuego.genero) {
          mostrarMensaje('Completa todos los campos obligatorios antes de guardar.', true);
          return;
        }

        try {
          const response = await fetch(getApiUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoVideojuego),
          });
          if (!response.ok) throw new Error('Error al crear el videojuego');
          await cargarVideojuegos();
          mostrarMensaje('Videojuego cargado correctamente.');
          renderCargaVideojuego();
        } catch (error) {
          mostrarMensaje(error.message, true);
        }
      });
    }

    function renderCargaFactura() {
      operationContainer.innerHTML = `
        <h2>Cargar nueva factura</h2>
        <div class="field-group">
          <div>
            <label for="fecha-input">Fecha</label>
            <input id="fecha-input" type="date" />
          </div>
          <div>
            <label for="cliente-input">Nombre del cliente</label>
            <input id="cliente-input" type="text" placeholder="Ej: Juan Pérez" />
          </div>
          <div>
            <label for="juegos-input">Lista de juegos</label>
            <input id="juegos-input" type="text" placeholder="Ej: Elden Ring, FIFA 26" />
          </div>
          <div>
            <label for="total-input">Suma total</label>
            <input id="total-input" type="number" min="0" step="0.01" placeholder="Ej: 130" />
          </div>
        </div>
        <button id="guardar-btn">Guardar factura</button>
      `;

      document.getElementById('guardar-btn').addEventListener('click', async () => {
        const nuevaFactura = {
          Fecha: document.getElementById('fecha-input').value,
          Nombre_Cliente: document.getElementById('cliente-input').value.trim(),
          juegos: document.getElementById('juegos-input').value.trim(),
          Suma_total: parseFloat(document.getElementById('total-input').value) || 0,
        };

        if (!nuevaFactura.Fecha || !nuevaFactura.Nombre_Cliente || !nuevaFactura.juegos) {
          mostrarMensaje('Completa todos los campos obligatorios antes de guardar.', true);
          return;
        }

        try {
          const response = await fetch(getApiUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaFactura),
          });
          if (!response.ok) {
            let msg = `Error al crear la factura`;
            try {
              const data = await response.json();
              if (data && data.message) msg = data.message;
            } catch (e) {}
            mostrarMensaje(msg, true);
            return;
          }
          await cargarFacturas();
          mostrarMensaje('Factura cargada correctamente.');
          renderCargaFactura();
        } catch (error) {
          mostrarMensaje(error.message, true);
        }
      });
    }

    function renderLista(tipo) {
      if (currentModule === 'facturas') {
        renderListaFacturas(tipo);
      } else {
        renderListaVideojuegos(tipo);
      }
    }

    function renderListaVideojuegos(tipo) {
      if (videojuegos.length === 0) {
        operationContainer.innerHTML = `
          <h2>${tipo === 'actualizar' ? 'Actualización' : 'Eliminación'} de videojuegos</h2>
          <p>No hay videojuegos disponibles para mostrar.</p>
        `;
        return;
      }

      const filas = videojuegos.map(videojuego => `
        <tr>
          <td>${videojuego.id || ''}</td>
          <td>${videojuego.titulo || ''}</td>
          <td>${videojuego.plataforma || ''}</td>
          <td>${videojuego.genero || ''}</td>
          <td>${videojuego.precio != null ? videojuego.precio : ''}</td>
          <td>${videojuego.stock != null ? videojuego.stock : ''}</td>
          <td class="button-row">
            ${tipo === 'actualizar' ? `<button class="secondary" data-action="actualizar" data-id="${videojuego.id}">Actualizar</button>` : ''}
            <button class="danger" data-action="eliminar" data-id="${videojuego.id}">Eliminar</button>
          </td>
        </tr>
      `).join('');

      operationContainer.innerHTML = `
        <h2>${tipo === 'actualizar' ? 'Actualización' : 'Eliminación'} de videojuegos</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Plataforma</th>
              <th>Género</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
        <div id="update-form-container"></div>
      `;

      operationContainer.querySelectorAll('button[data-action]').forEach(button => {
        button.addEventListener('click', async () => {
          const id = Number(button.dataset.id);
          if (button.dataset.action === 'actualizar') {
            mostrarFormularioActualizacionVideojuego(id);
          } else {
            await eliminarVideojuego(id);
          }
        });
      });
    }

    function renderListaFacturas(tipo) {
      if (facturas.length === 0) {
        operationContainer.innerHTML = `
          <h2>${tipo === 'actualizar' ? 'Actualización' : 'Eliminación'} de facturas</h2>
          <p>No hay facturas disponibles para mostrar.</p>
        `;
        return;
      }

      const filas = facturas.map(factura => `
        <tr>
          <td>${factura.Numero_Factura || ''}</td>
          <td>${factura.Fecha || ''}</td>
          <td>${factura.Nombre_Cliente || ''}</td>
          <td>${factura['Lista_Juegos'] || factura['Lista de juegos'] || ''}</td>
          <td>${factura.Suma_total != null ? factura.Suma_total : ''}</td>
          <td class="button-row">
            ${tipo === 'actualizar' ? `<button class="secondary" data-action="actualizar" data-id="${factura.Numero_Factura}">Actualizar</button>` : ''}
            <button class="danger" data-action="eliminar" data-id="${factura.Numero_Factura}">Eliminar</button>
          </td>
        </tr>
      `).join('');

      operationContainer.innerHTML = `
        <h2>${tipo === 'actualizar' ? 'Actualización' : 'Eliminación'} de facturas</h2>
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Lista de juegos</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
        <div id="update-form-container"></div>
      `;

      operationContainer.querySelectorAll('button[data-action]').forEach(button => {
        button.addEventListener('click', async () => {
          const id = Number(button.dataset.id);
          if (button.dataset.action === 'actualizar') {
            mostrarFormularioActualizacionFactura(id);
          } else {
            await eliminarFactura(id);
          }
        });
      });
    }

    function mostrarFormularioActualizacionVideojuego(id) {
      const videojuego = videojuegos.find(item => item.id === id);
      if (!videojuego) return;
      selectedItem = videojuego;

      const container = document.getElementById('update-form-container');
      container.innerHTML = `
        <div class="card">
          <h3>Actualizar videojuego: ${videojuego.titulo}</h3>
          <div class="field-group">
            <div>
              <label for="update-titulo">Título</label>
              <input id="update-titulo" type="text" value="${videojuego.titulo || ''}" />
            </div>
            <div>
              <label for="update-plataforma">Plataforma</label>
              <input id="update-plataforma" type="text" value="${videojuego.plataforma || ''}" />
            </div>
            <div>
              <label for="update-genero">Género</label>
              <input id="update-genero" type="text" value="${videojuego.genero || ''}" />
            </div>
            <div>
              <label for="update-precio">Precio</label>
              <input id="update-precio" type="number" min="0" step="0.01" value="${videojuego.precio != null ? videojuego.precio : 0}" />
            </div>
            <div>
              <label for="update-stock">Stock</label>
              <input id="update-stock" type="number" min="0" step="1" value="${videojuego.stock != null ? videojuego.stock : 0}" />
            </div>
          </div>
          <button id="save-update-btn">Guardar cambios</button>
        </div>
      `;

      document.getElementById('save-update-btn').addEventListener('click', async () => {
        const cambios = {
          titulo: document.getElementById('update-titulo').value.trim(),
          plataforma: document.getElementById('update-plataforma').value.trim(),
          genero: document.getElementById('update-genero').value.trim(),
          precio: parseFloat(document.getElementById('update-precio').value) || 0,
          stock: parseInt(document.getElementById('update-stock').value, 10) || 0,
        };

        if (!cambios.titulo || !cambios.plataforma || !cambios.genero) {
          mostrarMensaje('Completa los campos obligatorios del formulario de actualización.', true);
          return;
        }

        try {
          const response = await fetch(`${getApiUrl()}/${videojuego.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cambios),
          });
          if (!response.ok) throw new Error('Error al actualizar el videojuego');
          await cargarVideojuegos();
          mostrarMensaje('Videojuego actualizado correctamente.');
          renderLista('actualizar');
        } catch (error) {
          mostrarMensaje(error.message, true);
        }
      });
    }

    function mostrarFormularioActualizacionFactura(id) {
      const factura = facturas.find(item => item.Numero_Factura === id);
      if (!factura) return;
      selectedItem = factura;

      const container = document.getElementById('update-form-container');
      container.innerHTML = `
        <div class="card">
          <h3>Actualizar factura: ${factura.Numero_Factura}</h3>
          <div class="field-group">
            <div>
              <label for="update-fecha">Fecha</label>
              <input id="update-fecha" type="date" value="${factura.Fecha || ''}" />
            </div>
            <div>
              <label for="update-cliente">Nombre del cliente</label>
              <input id="update-cliente" type="text" value="${factura.Nombre_Cliente || ''}" />
            </div>
            <div>
              <label for="update-juegos">Lista de juegos</label>
              <input id="update-juegos" type="text" value="${factura['Lista_Juegos'] || factura['Lista de juegos'] || ''}" />
            </div>
            <div>
              <label for="update-total">Suma total</label>
              <input id="update-total" type="number" min="0" step="0.01" value="${factura.Suma_total != null ? factura.Suma_total : 0}" />
            </div>
          </div>
          <button id="save-update-btn">Guardar cambios</button>
        </div>
      `;

      document.getElementById('save-update-btn').addEventListener('click', async () => {
        const cambios = {
          Fecha: document.getElementById('update-fecha').value,
          Nombre_Cliente: document.getElementById('update-cliente').value.trim(),
          juegos: document.getElementById('update-juegos').value.trim(),
          Suma_total: parseFloat(document.getElementById('update-total').value) || 0,
        };

        if (!cambios.Fecha || !cambios.Nombre_Cliente || !cambios.juegos) {
          mostrarMensaje('Completa todos los campos obligatorios del formulario de actualización.', true);
          return;
        }

        try {
          const response = await fetch(`${getApiUrl()}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cambios),
          });
          if (!response.ok) {
            let msg = `Error al actualizar la factura`;
            try {
              const data = await response.json();
              if (data && data.message) msg = data.message;
            } catch (e) {}
            mostrarMensaje(msg, true);
            return;
          }
          await cargarFacturas();
          mostrarMensaje('Factura actualizada correctamente.');
          renderLista('actualizar');
        } catch (error) {
          mostrarMensaje(error.message, true);
        }
      });
    }

    async function eliminarVideojuego(id) {
      if (!confirm('¿Estás seguro de eliminar este videojuego?')) return;
      try {
        const response = await fetch(`${getApiUrl()}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar el videojuego');
        await cargarVideojuegos();
        mostrarMensaje('Videojuego eliminado correctamente.');
        renderLista('eliminar');
      } catch (error) {
        mostrarMensaje(error.message, true);
      }
    }

    async function eliminarFactura(id) {
      if (!confirm('¿Estás seguro de eliminar esta factura?')) return;
      try {
        const response = await fetch(`${getApiUrl()}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar la factura');
        await cargarFacturas();
        mostrarMensaje('Factura eliminada correctamente.');
        renderLista('eliminar');
      } catch (error) {
        mostrarMensaje(error.message, true);
      }
    }

    function mostrarMensaje(texto, esError = false) {
      messageBox.textContent = texto;
      messageBox.style.display = 'block';
      messageBox.style.background = esError ? '#fee2e2' : '#dcfce7';
      messageBox.style.color = esError ? '#991b1b' : '#166534';
    }

    init();