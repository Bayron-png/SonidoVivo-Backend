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
PostgreSQL es el motor relacional elegido para garantizar persistencia e integridad referencial entre los datos.

### **Seguridad y Autenticación:** JSON Web Tokens ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
Emisión de tokens firmados con tiempo de expiración para autenticar sesiones sin estado (*stateless*).

### **Infraestructura y Despliegue:** Amazon EC2 ![Amazon EC2](https://img.shields.io/badge/AWS-FF9900?AWS=flat&logo=amazonec2&logoColor=white)
Instancia Linux en la nube donde se ejecuta el servidor Node.js/Express de forma continua junto con la base de datos PostgreSQL, exponiendo los puertos necesarios mediante *Security Groups*.


### **Documentación API:** Swagger [![Swagger](https://img.shields.io/badge/Swagger-API_Docs-85EA2D?style=flat&logo=swagger&logoColor=black)](http://localhost:3000/api-docs)
Documentación interactiva autogenerada en las rutas. Permite inspeccionar los esquemas de entrada/salida, códigos de respuesta HTTP (`200`, `201`, `400`, `401`, `409`) y probar los endpoints protegidos directamente desde el navegador.

## Diagrama entidad Relación
- [Diagrama](https://drive.google.com/file/d/166MTdBqxLYp9Ur9AyB8VAm6_xn5V-Bmw/view?usp=drive_link)

## Organización y Arquitectura (Model - Repository - Service - Controller)

El backend está organizado bajo una arquitectura en capas (**Model - Repository - Service - Controller**), separando claramente la estructura de los datos, las consultas SQL, la lógica de negocio y el manejo de peticiones HTTP:

```text
sonidovivo-backend/
├── src/
│   ├── config/          # Conexión a PostgreSQL y configuración de Swagger
│   ├── model/           # Model: definición de entidades y estructuras
│   ├── repository/      # Repository: métodos a consultas SQL
│   ├── service/         # Service: lógica de negocio
│   ├── controller/      # Controller: manejo de peticiones, rutas y códigos de estado HTTP
│   ├── routes/          # Definición de endpoints versionados (/api/v1/...) y Swagger
│   └── app.js           # Punto de entrada principal del servidor Express
├── database.sql         # Script de creación de tablas y roles en PostgreSQL
├── package.json         # Dependencias y configuración del proyecto
└── README.md            # Documentación del proyecto


## Material Complementario
- [Drive - Sonido Vivo](https://drive.google.com/drive/folders/12_GrU2BjxDYlcv_tYToIAlKlEODdBjeE?usp=drive_link)
