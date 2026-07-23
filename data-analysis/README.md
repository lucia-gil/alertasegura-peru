# Data Analysis — AlertaSegura Perú

Parte de Data Analysis del proyecto. Este README cubre el setup y el
avance del **Sprint 1**.

## Sprint 1 — checklist

- [x] Definición de qué campos/métricas se van a analizar → [`fields_and_metrics.md`](./fields_and_metrics.md)
- [x] Dataset sintético inicial (CSV con reportes ficticios) → [`data/reportes_sinteticos.csv`](./data/reportes_sinteticos.csv)
- [x] Entorno de análisis listo (notebook + librerías) → [`notebooks/01_exploracion_inicial.ipynb`](./notebooks/01_exploracion_inicial.ipynb)

## Sprint 2 — checklist

- [x] Script de limpieza de datos (nulos, duplicados, formatos) → [`scripts/limpieza_datos.py`](./scripts/limpieza_datos.py)
- [x] Primeras estadísticas descriptivas → [`notebooks/02_limpieza_y_estadisticas.ipynb`](./notebooks/02_limpieza_y_estadisticas.ipynb)

## Sprint 3 — checklist

- [x] Dataset más realista (220 registros, con perfil de riesgo por distrito y "hotspots" de problemas recurrentes) → [`data/reportes_sinteticos.csv`](./data/reportes_sinteticos.csv)
- [x] Primeros gráficos: reportes por distrito y por tipo de incidente → [`notebooks/03_graficos_sprint3.ipynb`](./notebooks/03_graficos_sprint3.ipynb)

## Sprint 4 — checklist

- [x] Modelo de zonas de riesgo (KMeans) → [`notebooks/04_zonas_riesgo_kmeans.ipynb`](./notebooks/04_zonas_riesgo_kmeans.ipynb)
- [x] Dashboard interactivo (Plotly Dash) → [`scripts/dashboard_app.py`](./scripts/dashboard_app.py)
- [x] Opcional: cruce con datos públicos reales (INEI) → [`notebooks/05_cruce_datos_inei.ipynb`](./notebooks/05_cruce_datos_inei.ipynb)
<img width="1781" height="962" alt="image" src="https://github.com/user-attachments/assets/4e6b15ae-58ba-4af1-bf9d-c407ffcffb06" />


## Sprint 5 — checklist

- [x] Dashboard pulido (se agregaron gráficos de hora/día y tendencia) y exportable → [`scripts/dashboard_app.py`](./scripts/dashboard_app.py), [`scripts/exportar_dashboard_estatico.py`](./scripts/exportar_dashboard_estatico.py)
- [x] Resumen de insights en 1 página → [`insights_resumen.html`](./insights_resumen.html)
<img width="1662" height="957" alt="image" src="https://github.com/user-attachments/assets/233779f2-df9b-47a1-97cc-232ecc373474" />


## Estructura

```
data-analysis/
├── README.md
├── requirements.txt
├── fields_and_metrics.md         # qué campos/métricas se analizan y por qué
├── scripts/
│   ├── generar_dataset.py        # genera el CSV sintético (reproducible, seed fija)
│   ├── ensuciar_dataset.py       # genera una versión "sucia" para probar la limpieza
│   ├── limpieza_datos.py         # pipeline de limpieza (nulos, duplicados, formatos)
│   ├── dashboard_app.py          # dashboard interactivo (Plotly Dash)
│   └── assets/style.css          # estilos del dashboard
├── data/
│   ├── usuarios.csv
│   ├── categorias.csv
│   ├── reportes_sinteticos.csv   # dataset principal (Sprint 1/3)
│   ├── reportes_sucios.csv       # dataset con problemas inyectados (testing)
│   ├── reportes_limpios.csv      # salida del pipeline de limpieza (Sprint 2)
│   ├── reportes_con_zonas.csv    # reportes + zona de riesgo asignada por KMeans (Sprint 4)
│   ├── resumen_zonas_riesgo.csv  # resumen por zona: n° reportes, puntaje, distrito/categoría principal
│   ├── poblacion_distritos_lima.csv  # población real por distrito (INEI, con fuente citada)
│   └── reportes_vs_poblacion.csv     # reportes crudos vs. tasa por cada 10k habitantes
├── notebooks/
│   ├── 01_exploracion_inicial.ipynb
│   ├── 02_limpieza_y_estadisticas.ipynb
│   ├── 03_graficos_sprint3.ipynb
│   ├── 04_zonas_riesgo_kmeans.ipynb
│   └── 05_cruce_datos_inei.ipynb
├── insights_resumen.html         # resumen de 1 página (Sprint 5, para entrevistas)
└── dashboard_estatico.html       # export estático del dashboard (sin servidor)
```

`scripts/exportar_dashboard_estatico.py` genera `dashboard_estatico.html`
en la raíz de `data-analysis/` — un solo archivo que se abre con doble
clic, sin correr `python scripts/dashboard_app.py` ni instalar nada.

Nota: `reportes_sucios.csv`/`reportes_limpios.csv` quedaron generados sobre
la versión de 120 filas del dataset (Sprint 2); `reportes_sinteticos.csv`
ahora tiene 220 filas (Sprint 3) — no afecta la lógica de limpieza, solo
que si regeneras `reportes_sucios.csv` te va a salir con más filas.

## Por qué este esquema

El dataset sigue exactamente las entidades JPA que ya existen en el backend
(`src/main/java/com/alertasegura/backend/model/`: `Usuario`, `Categoria`,
`Reporte`), para que cuando el equipo de Desarrollo Web conecte la BD real
en el Sprint 2, el análisis migre sin fricción de CSV a datos reales con
los mismos nombres de columna y tipos.

## Setup del entorno

```bash
cd data-analysis
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
jupyter notebook notebooks/01_exploracion_inicial.ipynb
```

## Regenerar el dataset sintético

El CSV ya está generado y commiteado, pero si quieres regenerarlo (más
registros, otra semilla, etc.):

```bash
python3 scripts/generar_dataset.py
```

No requiere librerías externas (usa solo la librería estándar de Python),
así que se puede correr sin activar el venv.

## Correr el dashboard (Sprint 4)

```bash
# primero corre notebooks/04_zonas_riesgo_kmeans.ipynb una vez para generar
# data/reportes_con_zonas.csv (ya viene generado, no es obligatorio)
python scripts/dashboard_app.py
```

Abre `http://127.0.0.1:8050` en el navegador. Tiene filtros por categoría,
distrito y estado, KPIs arriba, mapa con las zonas de riesgo del KMeans, y
gráficos de reportes por distrito/categoría.
