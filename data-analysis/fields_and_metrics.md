# Campos y métricas a analizar

Basado en el modelo de datos ya definido en el backend
(`Usuario`, `Categoria`, `Reporte`).

## Campos disponibles por entidad

### `reportes` (tabla principal de análisis)

| Campo | Tipo | Uso analítico |
|---|---|---|
| `id` | int | identificador único del reporte |
| `usuario_id` | int (FK) | quién reporta — útil para detectar usuarios recurrentes o posible spam |
| `categoria` | string (FK → categorias.nombre) | tipo de incidente — dimensión principal |
| `descripcion` | string | texto libre — candidato a análisis de texto (Sprint 4+) |
| `latitud`, `longitud` | float | geolocalización — mapas de calor, clustering de zonas de riesgo |
| `distrito` | string | dimensión geográfica agregada (más manejable que lat/lon crudo) |
| `estado` | enum: `PENDIENTE` / `VERIFICADO` / `RECHAZADO` | calidad/confiabilidad del dato, tasa de verificación |
| `created_at` | datetime | serie temporal: hora del día, día de semana, tendencia |

### `usuarios`

| Campo | Uso analítico |
|---|---|
| `rol` (`CIUDADANO` / `MODERADOR`) | segmentar quién reporta vs. quién modera |
| `created_at` | antigüedad del usuario, crecimiento de la base de usuarios |

### `categorias`

| Campo | Uso analítico |
|---|---|
| `nombre` | catálogo de tipos de incidente (robo, acoso, accidente de tránsito, etc.) |

## Métricas / preguntas que va a responder el análisis

1. **Reportes por distrito** — ¿qué zonas concentran más incidentes?
2. **Reportes por categoría** — ¿qué tipo de incidente es más frecuente?
3. **Reportes por hora del día / día de la semana** — ¿hay franjas horarias de mayor riesgo?
4. **Tasa de verificación** — % de reportes `VERIFICADO` vs `PENDIENTE` vs `RECHAZADO`, global y por categoría/distrito (proxy de confiabilidad del dato).
5. **Densidad geográfica** — mapa de calor con `latitud`/`longitud` para identificar zonas de riesgo (insumo para el modelo de clustering del Sprint 4).
6. **Evolución temporal** — tendencia de reportes en el tiempo (`created_at`).
7. **Usuarios recurrentes** — distribución de reportes por `usuario_id` (detectar outliers / posible spam).

Estas métricas son la base de los gráficos del Sprint 3 (reportes por
distrito y por tipo de incidente) y del modelo de zonas de riesgo del
Sprint 4 (KMeans/heatmap).
