# Plan de Endpoints — AlertaSegura Perú

> Documentado en Sprint 1. Se implementan en Sprint 2 (auth + CRUD)
> y se auto-documentan en Swagger UI (`/swagger-ui.html`) a medida que se codean.

## Autenticación

| Método | Ruta | Descripción | Body | Respuesta |
|--------|------|-------------|------|-----------|
| POST | `/api/auth/register` | Registro de nuevo usuario | `{ nombre, email, password }` | 201 Created / 400 Bad Request |
| POST | `/api/auth/login` | Login, devuelve JWT | `{ email, password }` | 200 OK `{ token }` / 401 Unauthorized |

## Reportes

| Método | Ruta | Descripción | Auth requerida | Body |
|--------|------|-------------|-----------------|------|
| GET | `/api/reportes` | Lista todos los reportes | No (o pública con límites) | - |
| GET | `/api/reportes/{id}` | Detalle de un reporte | No | - |
| POST | `/api/reportes` | Crear un reporte | Sí (CIUDADANO o MODERADOR) | `{ categoriaId, descripcion, latitud, longitud, distrito }` |
| PUT | `/api/reportes/{id}` | Actualizar estado/datos | Sí (solo MODERADOR) | `{ estado }` |
| DELETE | `/api/reportes/{id}` | Eliminar un reporte | Sí (solo MODERADOR) | - |

## Categorías

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|-----------------|
| GET | `/api/categorias` | Lista todas las categorías | No |

## Notas de seguridad (para Sprint 2)

- Todos los endpoints de escritura (`POST`, `PUT`, `DELETE`) requieren JWT válido en header `Authorization: Bearer <token>`.
- El campo `estado` de un reporte **nunca** se acepta desde el cliente al crear — se fuerza a `PENDIENTE` en el backend.
- Solo `MODERADOR` puede cambiar `estado` o eliminar reportes — se valida con `@PreAuthorize` según el rol del JWT.
- Rate limiting en `/api/auth/login` y `/api/reportes` (POST) para prevenir fuerza bruta y spam.