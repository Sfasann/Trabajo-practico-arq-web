# Sistema de Gestión de Inventario: PixelVault Games 🎮

## 📝 Descripción del Proyecto
Este proyecto es una aplicación web para la administración interna y control de stock, y generacion de facturas de una tienda de videojuegos. Permite gestionar el catálogo de productos (Alta, Baja, Modificación y Consulta) y tambien la gestion de las facturas.

El backend está desarrollado sobre **Node.js** utilizando el framework **Express**, aplicando patrones de arquitectura limpia (separación de rutas y controladores) y cumpliendo con el **Nivel 2 del Modelo de Madurez de Richardson** para el diseño de APIs RESTful. La persistencia de datos se maneja temporalmente en memoria mediante un set de datos por defecto (*Data Seed*).

---

## 🚀 Instalación y Ejecución

### Requisitos Previos
* Tener instalado [Node.js](https://nodejs.org/) (versión LTS recomendada).

### Pasos para iniciar el proyecto:
1. **Clonar o extraer el proyecto** en tu directorio de preferencia.
2. **Abrir una terminal** posicionada en la carpeta raíz del proyecto (`Proyecto tp`).
3. **Instalar las dependencias** declaradas ejecutando:
```bash
   npm install
   npm run dev
     ```
   * **Modo Producción (Estándar):** Corre la aplicación de manera nativa con Node.
```bash
     npm start
     ```

El servidor iniciará por defecto en: `http://localhost:3000`

---

## 📖 Documentación de la API (RESTful)

La API interactúa con el recurso `productos` (videojuegos). Al iniciar, el sistema cuenta con un *Seed* de 5 videojuegos preestablecidos para facilitar el testing.

### Endpoints Disponibles

| Verbo HTTP | Endpoint | Descripción | Códigos de Estado Posibles |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/productos` | Obtiene el listado completo de videojuegos en el inventario. | `200 OK` |
| **`GET`** | `/api/productos/:id` | Obtiene los detalles de un videojuego específico según su ID. | `200 OK`<br>`404 Not Found` |
| **`POST`** | `/api/productos` | Crea y añade un nuevo videojuego al catálogo. | `201 Created`<br>`400 Bad Request` (Datos inválidos) |
| **`PUT`** | `/api/productos/:id` | Modifica los datos o el stock de un videojuego existente según su ID. | `200 OK`<br>`400 Bad Request`<br>`404 Not Found` |
| **`DELETE`** | `/api/productos/:id` | Elimina físicamente un videojuego del inventario según su ID. | `200 OK` (o `204 No Content`) <br>`404 Not Found` |

---

## 🛠️ Tecnologías Utilizadas
* **Backend:** Node.js, Express.js
* **Herramientas de desarrollo:** Nodemon
* **Pruebas de Endpoints:** Postman