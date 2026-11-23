Desarrollo Fullstack II - 002D
# **Sonido Vivo - Backend**

## Integrantes
  * Luis Antonio Álvarez Requejo - luis.alvarez@duocuc.cl
  * José Miguel Ibarra Vyhmeister - jo.ibarrav@duocuc.cl
  * Bayron Alexander Urrutia Flores - bay.urrutia@duocuc.cl

**Repositorio Frontend:** [Sonido Vivo | Frontend](https://github.com/Bayron-png/SonidoVivo)

## Contexto
Sonido Vivo es una tienda de instrumentos musicales que actualmente es atendida solo por su dueño y dos vendedores. Se ofrece un amplio catálogo de instrumentos y accesorios, pero últimamente reciben muchos pedidos por WhatsApp e Instagram, saturando al personal y llevando a perder ventas por no atender las mismas a tiempo.

Este backend implementa funcionalidades como:
- Inicio de sesión.
- Registro de usuarios.

## Tecnologías

### **Backend:** Node.js + Express  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
Se optó por usar `Node.js` y `Express` debido a los siguientes motivos:
- **Cohesión Fullstack:** Al utilizar React en el frontend, mantener JavaScript en el servidor unifica las tecnologías del equipo, simplificando el manejo de objetos JSON entre cliente y API.
- **Endpoints:** Express permite modularizar rutas mediante `express.Router()`, separando cada recurso en su propio archivo de forma ordenada.
- **Compatabilidad con Swagger:** Express integra de forma nativa `swagger-ui-express` y `swagger-jsdoc`, permitiendo levantar documentacion interactiva en /api-docs.
**Base de Datos**

### **Base de datos:** PostgreSQL ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
Se optó por **PostgreSQL** como motor de base de datos relacional
- **Cumplimiento estricto del estándar SQL e integridad referencial:** Permite definir llaves primarias, foráneas, restricciones (`UNIQUE`, `CHECK`, `NOT NULL`) y tipos de datos estrictos que aseguran la consistencia entre `roles`, `usuarios`, `productos` y `pedidos`.
- **Transacciones ACID para Control de Stock:** Al gestionar pedidos e inventario de instrumentos, las propiedades ACID evitan inconsistencias o ventas duplicadas cuando dos clientes compran el último producto disponible al mismo tiempo.

### **Seguridad y Autenticación:** JSON Web Tokens ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
Emisión de tokens firmados con tiempo de expiración para autenticar sesiones sin estado (*stateless*).

Las rutas `GET`, `PUT` y `DELETE /api/v1/usuarios` requieren un token JWT enviado
como `Authorization: Bearer <token>` y el rol `Administrador`. Sin token se
responde `401`; con un rol distinto, `403`. Configure `JWT_SECRET` para firmar y
verificar los tokens.

CORS solo permite el origen indicado en `FRONTEND_URL`. En desarrollo, si no se
define, se permite `http://localhost:5173`; en despliegue configure esa variable
con la URL de origen del frontend.

El registro valida el formato del correo y requiere una contraseña de al menos
8 caracteres, con un máximo de 72 bytes para evitar el truncamiento de bcrypt.

### **Infraestructura y Despliegue:** Amazon EC2 ![Amazon EC2](https://img.shields.io/badge/AWS-FF9900?style=flat&logo=amazonec2&logoColor=white)
Se eligió desplegar el backend en una instancia **Amazon EC2** en lugar de una arquitectura *serverless* como **AWS Lambda** por las siguientes razones:
- **Servidor Continuo y Sin Arranques en Frío (*Cold Starts*):** A diferencia de Lambda, donde las funciones se detienen tras periodos de inactividad provocando latencia inicial en las primeras peticiones, EC2 mantiene el proceso de Node.js/Express activo 24/7, ofreciendo tiempos de respuesta inmediatos al navegar por el catálogo.
- **Compatibilidad Directa con Express y Swagger UI:** EC2 permite ejecutar una aplicación monolítica tradicional en Express sin necesidad de adaptar rutas ni dependencias a eventos de API Gateway, sirviendo tanto la API REST como la interfaz interactiva de Swagger (`/api-docs`) desde el mismo servidor.
- **Control Total del Entorno y Coexistencia con PostgreSQL:** Brinda acceso directo al sistema operativo Linux para administrar puertos (*Security Groups*), variables de entorno y alojar el motor de base de datos PostgreSQL en la misma infraestructura sin costos ni configuraciones adicionales de VPC complejas.


### **Documentación API:** Swagger [![Swagger](https://img.shields.io/badge/Swagger-API_Docs-85EA2D?style=flat&logo=swagger&logoColor=black)](http://localhost:3000/api-docs)
Documentación interactiva autogenerada en las rutas. Permite inspeccionar los esquemas de entrada/salida, códigos de respuesta HTTP (`200`, `201`, `400`, `401`, `409`) y probar los endpoints protegidos directamente desde el navegador.

## Instalación y ejecución local

> El proyecto usa **PostgreSQL**.

### Requisitos
- [Node.js](https://nodejs.org/) instalado. En Windows y macOS se puede descargar el instalador desde la página oficial. En Ubuntu/Debian se puede instalar con:

  ```bash
  sudo apt update
  sudo apt install nodejs npm
  node --version
  npm --version
  ```
- [PostgreSQL](https://www.postgresql.org/download/) instalado y con el servicio iniciado. Se puede administrar la base de datos desde `psql` o desde pgAdmin.

### Pasos

1. Clonar el repositorio y entra a la carpeta:

   ```bash
   git clone https://github.com/Bayron-png/SonidoVivo-Backend.git
   cd SonidoVivo-Backend
   ```

2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Instalar PostgreSQL (solo si no está instalado)
```
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
psql --version
sudo -u postgres psql
```

4. Crear un usuario y una base de datos en PostgreSQL. Desde una terminal, con `psql` disponible:

   En la consola de PostgreSQL, ejecutar (reemplazar la contraseña por una propia) y luego salir con `\q`:

   ```sql
   CREATE USER sonidovivo_user WITH PASSWORD 'elegir_una_clave_local';
   CREATE DATABASE sonidovivo OWNER sonidovivo_user;
   ```

   También se puede crear el usuario y la base de datos desde pgAdmin. Si PostgreSQL está en otro puerto o servidor, usar esos datos en los pasos siguientes.

4. Desde la carpeta del proyecto, crea las tablas y roles ejecutando el script:

   ```bash
   psql -h localhost -p 5432 -U sonidovivo_user -d sonidovivo -f src/database/CreacionTablas-SonidoVivo.sql
   ```

   Ingresar la contraseña que se definió para `sonidovivo_user`. Como alternativa, abrir `src/database/CreacionTablas-SonidoVivo.sql` en el Query Tool de pgAdmin, conectado a la base `sonidovivo`, y ejecutar el script.

5. Crea un archivo `.env` en la raíz del proyecto con la configuración del equipo:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=sonidovivo_user
   DB_PASSWORD=contraseña_del_usuario_creado
   DB_NAME=sonidovivo
   JWT_SECRET=reemplaza_por_un_secreto_aleatorio_largo
   JWT_EXPIRES_IN=2h
   FRONTEND_URL=http://localhost:5173
   ```
**Generar JWT_SECRET**
```env
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

   `DB_PASSWORD` debe coincidir con la contraseña creada para el usuario de PostgreSQL. No compartir ni subir el archivo `.env` al repositorio.

6. Iniciar el backend:

   ```bash
   npm start
   ```

   El servidor queda disponible en `http://localhost:3000`. En la consola debe aparecer el mensaje de conexión exitosa a PostgreSQL. Si la conexión falla, comprobar que el servicio de PostgreSQL esté iniciado y que los valores de `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` sean correctos.

## Diagrama entidad Relación
- [Diagrama](https://drive.google.com/file/d/166MTdBqxLYp9Ur9AyB8VAm6_xn5V-Bmw/view?usp=drive_link)

## Organización y Arquitectura (Model - Repository - Service - Controller)

El backend está organizado bajo una arquitectura en capas (**Model - Repository - Service - Controller**), separando claramente la estructura de los datos, las consultas SQL, la lógica de negocio y el manejo de peticiones HTTP:

```
sonidovivo-backend/
├── src/
│   ├── config/          # Conexión a PostgreSQL
│   ├── model/           # Forma y filtrado de los datos de usuario
│   ├── repository/      # Consultas SQL para autenticación y usuarios
│   ├── service/         # Reglas y flujos de negocio
│   ├── controller/      # Traducción entre HTTP y servicios
│   ├── routes/          # Endpoints de autenticación y usuarios
│   └── app.js           # Configuración de Express y montaje de rutas
├── server.js            # Carga de configuración e inicio del servidor
├── package.json         # Dependencias y configuración del proyecto
└── README.md            # Documentación del proyecto
```

Las rutas no acceden directamente a la base de datos: los controladores delegan en servicios, los servicios coordinan la lógica y los repositorios ejecutan SQL. El model de usuario limita los campos que se devuelven en las respuestas.

## Estado de Avance

| Operación | Estado | Detalle |
| :--- | :--- | :--- |
| **Tabla de usuarios** | Listo | Tablas `roles` (`Administrador`, `Cliente`) y `usuarios` creadas en PostgreSQL con persistencia real y contraseñas encriptadas con `bcryptjs`. |
| **Inicio de sesión** | Listo | Endpoint `POST /api/v1/auth/login` operativo. Verifica hash, emite token JWT con vigencia y devuelve error genérico ante credenciales inválidas. |
| **Registro (crear usuario)** | Listo | Endpoint `POST /api/v1/auth/register` operativo y probado. El servidor asigna el rol inicial `Cliente`. |
| **Modificar usuario** | Listo | Endpoint `PUT /api/v1/usuarios/:id` operativo; permite actualizar nombre, correo y rol. Requiere token JWT de administrador. |
| **Listar usuarios** | Listo | Endpoint `GET /api/v1/usuarios` operativo. Requiere token JWT de administrador. |
| **Eliminar o desactivar usuario** | Listo | Endpoint `DELETE /api/v1/usuarios/:id` operativo; desactiva al usuario sin borrar sus datos. Requiere token JWT de administrador. |

## Material Complementario
- [Drive | Sonido Vivo](https://drive.google.com/drive/folders/12_GrU2BjxDYlcv_tYToIAlKlEODdBjeE?usp=drive_link)
