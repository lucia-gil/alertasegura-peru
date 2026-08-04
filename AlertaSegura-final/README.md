# AlertaSegura Perú

Plataforma de reportes ciudadanos con mapa de riesgo por zona (Lima, Perú).
Proyecto full-stack: backend Spring Boot + frontend React, con seguridad
aplicada en cada capa.
## Integrantes:
- Rosell Pretel Villaorduña
- Willian Antaurco Corsino
- Lucia Gil Vivanco
## Estructura

```
AlertaSegura/
├── pom.xml                 <- proyecto Maven (backend) - raiz del repo
├── src/                     <- backend Java
├── frontend/                <- frontend React, proyecto npm separado
├── data-analysis/           <- scripts Python de analisis
├── seguridad/                <- checklist OWASP y notas de seguridad
├── alertasegura_db.sql       <- schema de la base de datos MySQL
└── docs/api-plan.md          <- plan de la API
```

**Importante:** este es un monorepo con dos proyectos independientes que se
abren por separado: `pom.xml` (raíz) es el proyecto Maven que abres en
IntelliJ. `frontend/` es un proyecto npm aparte, no se abre en IntelliJ,
se corre desde terminal.

## Guía rápida

Ver **`GUIA_INSTALACION.pdf`** para el paso a paso completo (IntelliJ,
MySQL, backend, frontend, y explicación de toda la seguridad implementada).

Resumen ultra rápido:

```bash
# 1. Base de datos
mysql -u root -p < alertasegura_db.sql

# 2. Backend - abrir esta carpeta en IntelliJ, o por terminal:
cp src/main/resources/application-example.properties src/main/resources/application-dev.properties
# editar application-dev.properties con tu password de MySQL y un JWT_SECRET
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 3. Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

Backend en `http://localhost:8080`, frontend en `http://localhost:5173`.

## Identidad visual

Paleta "Andes" (morado/índigo con acento ámbar), tipografía Sora + Inter.
Ver `frontend/README.md` para el detalle del sistema de diseño.

## Seguridad implementada

- Autenticación con JWT (firma HS256)
- Contraseñas hasheadas con BCrypt
- Autorización por rol con `@PreAuthorize` (Spring Method Security)
- Rate limiting con Bucket4j (5 intentos/min en login, 10/min en creación de reportes)
- CORS restringido a los orígenes del frontend
- Validación de entrada con Bean Validation en todos los DTOs

Detalle completo en `GUIA_INSTALACION.pdf` y `seguridad/`.
