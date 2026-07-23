# Data Analysis — AlertaSegura Perú

Parte de Data Analysis del proyecto. Este README cubre el setup y el
avance del **Sprint 1**.

## Sprint 1 — checklist

- [x] Definición de qué campos/métricas se van a analizar → [`fields_and_metrics.md`](./fields_and_metrics.md)
- [x] Dataset sintético inicial (CSV con reportes ficticios) → [`data/reportes_sinteticos.csv`](./data/reportes_sinteticos.csv)
- [x] Entorno de análisis listo (notebook + librerías) → [`notebooks/01_exploracion_inicial.ipynb`](./notebooks/01_exploracion_inicial.ipynb)

## Estructura

```
data-analysis/
├── README.md
├── requirements.txt
├── fields_and_metrics.md       # qué campos/métricas se analizan y por qué
├── scripts/
│   └── generar_dataset.py      # genera el CSV sintético (reproducible, seed fija)
├── data/
│   ├── usuarios.csv
│   ├── categorias.csv
│   └── reportes_sinteticos.csv # dataset principal para el análisis
└── notebooks/
    └── 01_exploracion_inicial.ipynb
```

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
