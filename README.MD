# Sistema de Gestión de Videojuegos y Facturación 🎮

Este proyecto es una aplicación web para la administración interna y control de stock, y generacion de facturas de una tienda de videojuegos. Permite gestionar el catálogo de videojuegos (Alta, Baja, Modificación y Consulta) y tambien la gestion de las facturas(Tambien es posible dar de Alta, Baja, Modificación y Consulta), en donde para se verifica que para sumar juegos a la factura estos deben existir y tener stock.



El backend está desarrollado sobre Node.js utilizando el framework Express, aplicando patrones de arquitectura limpia (separación de rutas y controladores) y cumpliendo con el Nivel 2 del Modelo de Madurez de Richardson para el diseño de APIs RESTful

---

## 🏛️ Arquitectura del Sistema

### 💻 Backend (Node.js & Express)
Organizado en capas independientes para cumplir con el principio de **Responsabilidad Única**:
* **Servidor (`app.js`):** Punto de entrada de la aplicación. Configura los middlewares globales (`express.json()`), sirve los archivos estáticos del cliente y delega los prefijos de rutas globales.
* **Capa de Rutas (`Routes/`):** Actúa como el enrutador del tráfico HTTP. Contiene los Endpoints
* **Capa de Controladores (`Controllers/`):** Contiene la logica de negocio y la definición de los metodos HTTP.
* **Capa de Servicios (`Services/`):** Capa encargada de la persistencia y reglas de negocio. 

### 🌐 Frontend (HTML, JavaScript)
* **`index.html`:** Contiene exclusivamente el esqueleto semántico de la aplicación, el diseño responsivo (CSS incrustado) y los selectores interactivos de módulos.
* **`appfront.js`:** Archivo independiente que maneja la lógica del cliente. 
---

## 💾 Persistencia de Datos (Base de Datos Local)
El sistema utiliza archivos planos en formato **JSON** localizados en la carpeta `Data/` para emular una base de datos:
* `DataVideojuegos.json`: Almacena el catálogo de videojuegos con campos como id, título, plataforma, género, precio y stock.
* `DataFacturas.json`: Almacena el histórico de ventas realizadas con su número de factura, fecha, cliente, ítems y monto total.


---

## Endpoints de la API (REST - Richardson Nivel 2)

La API interactúa mediante la transferencia de datos puros en formato JSON utilizando de manera semántica los verbos HTTP y códigos de estado apropiados (`200`, `201`, `400`, `404`, `500`).

### Módulo Videojuegos (`/api/videojuegos`)
* `GET /api/videojuegos` - Obtiene la lista completa de videojuegos (`200 OK`).
* `GET /api/videojuegos/:id` - Busca un videojuego específico por su ID único (`200 OK` o `404 Not Found`).
* `POST /api/videojuegos` - Registra un nuevo videojuego generando un ID aleatorio automatizado (`201 Created` o `400 Bad Request`).
* `PUT /api/videojuegos/:id` - Actualiza de manera completa un videojuego existente (`200 OK` o `404/400`).
* `DELETE /api/videojuegos/:id` - Remueve físicamente un juego del registro (`200 OK` o `404 Not Found`).

### Módulo Facturas (`/api/facturas`)
* `GET /api/facturas` - Obtiene el historial completo de facturas emitidas.
* `GET /api/facturas/:id` - Busca una factura específica mediante su número correlativo.
* `POST /api/facturas` - Crea un nuevo registro de venta histórica (`201 Created`).
* `PUT /api/facturas/:id` - Modifica datos de una factura emitida previamente.
* `DELETE /api/facturas/:id` - Da de baja una factura del historial.

---

## Instalación y Despliegue 

### Requisitos Previos
Tener instalado Node.js previamente

### Pasos para Ejecutar
1. Clonar el repositorio o descargar las carpetas del proyecto
2. Si es necesario abrir la terminal raiz del proyecto e instalar las dependencias
3. En la terminal, posicionarce con "cd" en la carpeta raíz del proyecto y ejecutarlo con 
   npm run dev

## Testear el frontend
1. Abrir en el navegador la pagina http://localhost:3000/index.html
2. Tener corriendo el servidor desde la terminal, y una vez en la pagina 
   probar realizar la carga, baja, modificación y visualización de los recursos

## Testear desde Postman
1. Tener el servidor corriendo
# Para GET Y GET ID
* Es igual para facturas
* GET http://localhost:3000/api/videojuegos/ o http://localhost:3000/api/facturas/
* GETId http://localhost:3000/api/videojuegos/:id ---Ej: http://localhost:3000/api/videojuegos/3

# Para POST
* POST http://localhost:3000/api/videojuegos/ o http://localhost:3000/api/facturas/

* En el body para los videojuegos por ej: {
    "titulo": "FIFA 27",
    "plataforma": "Xbox Series X",
    "genero": "Deportes",
    "precio": 70,
    "stock": 23
    }
* En el body para las facturas por ej:{
        "Fecha": "2021-06-17",
        "Nombre_Cliente": "Martin p montilla",
        "Suma_total": 50,
        "lista de juegos": "Cyberpunk 2077, ELDEN RING"
    } *nota: "lista de juegos" tiene que ser escrito en todo minuscula

# Para PUT
* PUT http://localhost:3000/api/videojuegos/:id o http://localhost:3000/api/facturas/:id
* El body debe ser del mismo formato que post, modificando los valores que se desee

# Para DELETE
* DELETE http://localhost:3000/api/videojuegos/:id o http://localhost:3000/api/facturas/:id ----- Ej: http://localhost:3000/api/facturas/252