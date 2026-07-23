"""
Dashboard interactivo de AlertaSegura Perú (Sprint 4).

Muestra los reportes sobre un mapa coloreados por zona de riesgo (KMeans),
con filtros por categoría/distrito/estado y gráficos de resumen.

Uso:
    python scripts/dashboard_app.py
    # abre http://127.0.0.1:8050 en el navegador

Requiere haber corrido antes notebooks/04_zonas_riesgo_kmeans.ipynb para
generar data/reportes_con_zonas.csv (si no existe, usa
reportes_sinteticos.csv sin columna de zona).
"""

import os
import pandas as pd
import plotly.express as px
from dash import Dash, dcc, html, Input, Output

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
PATH_CON_ZONAS = os.path.join(DATA_DIR, "reportes_con_zonas.csv")
PATH_BASE = os.path.join(DATA_DIR, "reportes_sinteticos.csv")

if os.path.exists(PATH_CON_ZONAS):
    reportes = pd.read_csv(PATH_CON_ZONAS, parse_dates=["created_at"])
else:
    reportes = pd.read_csv(PATH_BASE, parse_dates=["created_at"])
    reportes["zona"] = -1  # sin zona calculada aún

reportes["zona"] = reportes["zona"].astype(str)

app = Dash(__name__)
app.title = "AlertaSegura Perú — Dashboard"

CATEGORIAS = sorted(reportes["categoria"].unique())
DISTRITOS = sorted(reportes["distrito"].unique())
ESTADOS = sorted(reportes["estado"].unique())


def kpi_card(titulo, valor):
    return html.Div(
        [html.Div(titulo, className="kpi-titulo"), html.Div(valor, className="kpi-valor")],
        className="kpi-card",
    )


app.layout = html.Div(
    [
        html.H1("AlertaSegura Perú — Dashboard de reportes"),
        html.Div(
            [
                html.Div(
                    [
                        html.Label("Categoría"),
                        dcc.Dropdown(CATEGORIAS, CATEGORIAS, multi=True, id="filtro-categoria"),
                    ],
                    className="filtro",
                ),
                html.Div(
                    [
                        html.Label("Distrito"),
                        dcc.Dropdown(DISTRITOS, DISTRITOS, multi=True, id="filtro-distrito"),
                    ],
                    className="filtro",
                ),
                html.Div(
                    [
                        html.Label("Estado"),
                        dcc.Dropdown(ESTADOS, ESTADOS, multi=True, id="filtro-estado"),
                    ],
                    className="filtro",
                ),
            ],
            className="filtros",
        ),
        html.Div(id="kpis", className="kpis"),
        html.Div(
            [
                dcc.Graph(id="mapa", className="grafico-grande"),
            ]
        ),
        html.Div(
            [
                dcc.Graph(id="grafico-distrito", className="grafico-mitad"),
                dcc.Graph(id="grafico-categoria", className="grafico-mitad"),
            ],
            className="fila-graficos",
        ),
    ]
)


@app.callback(
    Output("kpis", "children"),
    Output("mapa", "figure"),
    Output("grafico-distrito", "figure"),
    Output("grafico-categoria", "figure"),
    Input("filtro-categoria", "value"),
    Input("filtro-distrito", "value"),
    Input("filtro-estado", "value"),
)
def actualizar(categorias, distritos, estados):
    df = reportes[
        reportes["categoria"].isin(categorias or CATEGORIAS)
        & reportes["distrito"].isin(distritos or DISTRITOS)
        & reportes["estado"].isin(estados or ESTADOS)
    ]

    total = len(df)
    pct_verificados = (df["estado"] == "VERIFICADO").mean() * 100 if total else 0
    distrito_top = df["distrito"].value_counts().idxmax() if total else "—"
    categoria_top = df["categoria"].value_counts().idxmax() if total else "—"

    kpis = [
        kpi_card("Total de reportes", total),
        kpi_card("% verificados", f"{pct_verificados:.0f}%"),
        kpi_card("Distrito con más reportes", distrito_top),
        kpi_card("Incidente más frecuente", categoria_top),
    ]

    mapa = px.scatter_map(
        df, lat="latitud", lon="longitud", color="zona" if "zona" in df else "categoria",
        hover_data=["categoria", "distrito", "estado"],
        zoom=9.5, height=500,
        title="Reportes por zona de riesgo",
    )
    mapa.update_layout(map_style="open-street-map", margin=dict(l=0, r=0, t=40, b=0))

    grafico_distrito = px.bar(
        df["distrito"].value_counts().sort_values().reset_index(),
        x="count", y="distrito", orientation="h",
        title="Reportes por distrito",
        labels={"count": "N° de reportes", "distrito": ""},
    )

    grafico_categoria = px.bar(
        df["categoria"].value_counts().sort_values().reset_index(),
        x="count", y="categoria", orientation="h",
        title="Reportes por tipo de incidente",
        labels={"count": "N° de reportes", "categoria": ""},
    )

    return kpis, mapa, grafico_distrito, grafico_categoria


if __name__ == "__main__":
    app.run(debug=True)
