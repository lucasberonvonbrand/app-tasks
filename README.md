# Fullstack Task Manager - Dockerized Environment 🐳

Este repositorio aloja un entorno de desarrollo listo para producción, estructurado sobre una arquitectura **multi-contenedor completamente automatizado**. El objetivo principal de este proyecto no radica en la complejidad del código del frontend o backend, sino en **demostrar la integración, orquestación, optimización de infraestructura y persistencia de datos** utilizando herramientas de contenerización moderna.

A través de un único archivo de orquestación, el sistema levanta de forma coordinada una Single Page Application, una API REST y un motor de base de datos relacional evitando cualquier tipo de instalación o configuración nativa en la máquina anfitriona.

---

## 📂 Estructura del Proyecto

El repositorio mantiene un diseño desacoplado y ordenado para facilitar el contexto de construcción de cada servicio:

```text
app-tasks/
│
├── backend/              # Microservicio API REST (Java 21 + Spring Boot)
│   ├── src/              # Código fuente estructurado por capas
│   ├── pom.xml           # Configuración de dependencias de Maven
│   └── Dockerfile        # Construcción optimizada Multi-Stage
│
├── frontend/             # Aplicación de interfaz (Angular 19 + Nginx)
│   ├── src/              # Componentes funcionales y lógica de Signals
│   ├── nginx.conf        # Configuración de proxy y enrutamiento para Nginx
│   └── Dockerfile        # Construcción optimizada con servidores de producción
│
├── .env                  # Variables de entorno críticas (Excluido de Git)
└── compose.yaml          # Archivo central de orquestación multi-servicio
```

## 🏗️ Ecosistema Técnico y Orquestación

El entorno está compuesto por tres tecnologías clave integradas a través de Docker Compose:

* **Frontend (Angular 19 & Nginx)**: Una SPA moderna que utiliza el nuevo flujo de reactividad basado en Signals. El entorno productivo se sirve mediante un servidor Nginx Alpine ligero.
* **Backend (Java 21 & Spring Boot 3)**: Una API con arquitectura clásica por capas (Controlador, Servicio, Repositorio, Modelo) que expone endpoints REST securizados contra políticas de CORS.
* **Persistencia (MySQL 8.0)**: El motor relacional encargado de salvaguardar las entidades de negocio del sistema.

## 🛠️ Pilares de Infraestructura y Buenas Prácticas Aplicadas

### 1. Multi-Stage Builds (Optimización Extrema de Imágenes)
Con el fin de evitar el acarreo de herramientas innecesarias a los entornos productivos, se implementaron etapas secuenciales de construcción en los Dockerfiles:
* **En el Backend**: Se utiliza una imagen completa con Maven y el JDK para compilar el proyecto en aislamiento. Una vez generado el artefacto ejecutable, este se transfiere a una capa limpia que únicamente posee el entorno de ejecución ligero de Java: `eclipse-temurin:21-jre-alpine`.
* **En el Frontend**: Node.js compila y transpila la aplicación de Angular 19 a ficheros estáticos de producción (HTML, JS, CSS). Posteriormente, estos artefactos se copian al directorio raíz de Nginx Alpine, descartando por completo los binarios de Node y reduciendo drásticamente el peso de la imagen y su superficie de ataque frente a vulnerabilidades.

### 2. Persistencia de Datos Garantizada (Volumes)
Los contenedores están diseñados bajo la premisa de ser efímeros. Para cumplir con el requerimiento vital de resiliencia, el servicio de base de datos incorpora un volumen lógico mapeado (`mysql-data`). El objetivo principal es asegurar que ante una destrucción completa del entorno (`docker compose down`) o reinicios inesperados, los datos insertados persistan intactos al levantar la infraestructura nuevamente.

### 3. Orquestación Segura y Control de Ciclo de Vida
* **Healthchecks & Resiliencia**: El contenedor de MySQL ejecuta un comando nativo de comprobación de salud (`mysqladmin ping`). El backend Java incluye una política de inicio condicionada (`condition: service_healthy`), obligando a Spring Boot a esperar que el motor de base de datos esté completamente listo para aceptar transacciones antes de intentar su propio arranque.
* **Inyección de Credenciales (.env)**: Toda la configuración crítica (claves de root, nombres de esquemas, credenciales de JPA y URLs de conexión de Spring) se administra dinámicamente en tiempo de ejecución extrayendo los valores de un archivo `.env` local.
* **Control de Recursos Corporativos**: Se delimitaron techos de hardware estrictos (limits de CPU y Memoria RAM) para el contenedor de Java, garantizando que el consumo de la JVM jamás desestabilice el sistema anfitrión.

## 🚀 Instrucciones de Despliegue Rápido

### Requisitos Previos
Disponer de Docker Desktop en ejecución.

### Pasos para iniciar la infraestructura:

1. **Clonar el repositorio e ingresar a la carpeta raíz**:
```bash
git clone https://github.com/lucasberonvonbrand/app-tasks.git
cd app-tasks
```

2. **Configurar el archivo de variables de entorno**:
Crear un archivo llamado `.env` en la raíz de la carpeta `app-tasks/` e incorporar las siguientes credenciales de entorno:
```env
# Configuración de MySQL
MYSQL_ROOT_PASSWORD=secure_root_password
MYSQL_DATABASE=tasks_db
MYSQL_USER=app_user
MYSQL_PASSWORD=secure_password

# Configuración de Conexión Spring
SPRING_DATASOURCE_URL=jdbc:mysql://mysql-db:3306/tasks_db?allowPublicKeyRetrieval=true&useSSL=false
SPRING_DATASOURCE_USERNAME=app_user
SPRING_DATASOURCE_PASSWORD=secure_password
```

3. **Compilar y levantar todo el ecosistema en segundo plano**:
```bash
docker compose up --build -d
```

4. **Acceso a las aplicaciones**:
* **Aplicación Web (Angular 19)**: Acceder de forma directa a http://localhost (Puerto 80).
* **Endpoints de la API (Spring Boot)**: Monitorear el JSON del CRUD en http://localhost:8080/api/tasks.
* **Conexión Externa a Base de Datos**: Administrar el motor mediante herramientas de escritorio (DBeaver/Workbench) apuntando a `localhost:3307` (mapeado externo para evitar conflictos en el host).

5. **Para apagar el ecosistema manteniendo los datos resguardados en el volumen**:
```bash
docker compose stop
```

---
*Proyecto desarrollado por Lucas Ruben Beron Von Brand* 🚀
