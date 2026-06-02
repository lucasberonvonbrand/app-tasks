# Fullstack Task Manager - Docker & CI/CD Pipeline 🐳🚀

🚀 **[¡Prueba la aplicación en producción aquí!](https://app-tasks-frontend.onrender.com)**
*(Nota: Al estar desplegada en una capa gratuita, la aplicación puede tardar hasta 2 minutos en "despertar" tras un período de inactividad. ¡Gracias por la paciencia!)*

Este repositorio aloja un entorno de desarrollo y producción automatizado, estructurado sobre una arquitectura **multi-contenedor** y respaldado por un **flujo de Integración y Despliegue Continuo (CI/CD)**. El objetivo principal del proyecto es demostrar conocimientos en orquestación de infraestructura, automatización de pruebas y despliegues seguros en la nube.

A través de Docker, el sistema levanta localmente una SPA, una API REST y un motor relacional. En la nube, un pipeline automatiza el testing y despliegue del proyecto hacia entornos administrados como **Render** y **Aiven**.

---

## 📂 Estructura del Proyecto

El repositorio mantiene un diseño desacoplado y ordenado para facilitar el contexto de construcción de cada servicio:

```text
app-tasks/
│
├── .github/workflows/    # Pipelines de automatización (GitHub Actions)
│   ├── ci-cd.yml         # Flujo principal de CI/CD (Testing y Despliegue)
│   └── release.yml       # Flujo de creación y versionado de releases
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
* **Persistencia (MySQL 8.0)**: El motor relacional encargado de salvaguardar las entidades de negocio del sistema. En producción, se utiliza un clúster de base de datos gestionado en la nube provisionado a través de **Aiven**.

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

### 4. Integración y Despliegue Continuo (CI/CD) y Testing Automatizado
* **Pipeline con GitHub Actions**: Cada evento de tipo `push` hacia la rama principal dispara un flujo de trabajo automatizado en la nube.
* **Testing Automatizado (Gatekeepers)**: La fase de compilación del Backend ejecuta pruebas estrictas. Si algún test falla, el pipeline aborta su ejecución inmediatamente, previniendo que código defectuoso llegue a producción. La estrategia se divide en:
  * **Pruebas Unitarias (Capa de Servicio)**: Uso de `JUnit 5` y `Mockito` para aislar `TaskService` simulando el acceso a datos. Valida exhaustivamente la lógica de negocio y el manejo de excepciones personalizadas (como `TaskNotFoundException`).
  * **Pruebas de Integración (Capa HTTP)**: Uso de `@SpringBootTest` y `MockMvc` para levantar el contexto de Spring, simular peticiones reales (ej. `POST /api/tasks`) y verificar de extremo a extremo los códigos de estado (ej. `201 Created`) y el mapeo correcto de JSON.
* **Despliegue Cloud Ininterrumpido**: Una vez que el código supera las métricas de calidad, GitHub Actions coordina el despliegue automático hacia los servidores de **Render** (API y Frontend), enlazándose de manera segura con la base de datos alojada en **Aiven**.

## 🚀 Instrucciones de Despliegue Rápido

> **💡 Nota:** Si solo deseas evaluar la aplicación como usuario, no es necesario levantar la infraestructura local. Puedes acceder directamente al **[entorno de producción público desplegado en Render](https://app-tasks-frontend.onrender.com)**.

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
