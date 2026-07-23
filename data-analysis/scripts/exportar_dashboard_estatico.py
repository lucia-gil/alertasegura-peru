"""
Exporta el dashboard como un único archivo HTML autocontenido (sin filtros
interactivos, sin necesidad de correr un servidor Dash) — para compartir,
adjuntar en un reporte, o abrir directo con doble clic.

Uso:
    python scripts/exportar_dashboard_estatico.py
    # genera dashboard_estatico.html en la carpeta data-analysis/
"""

import os
import pandas as pd
import plotly.express as px
import plotly.io as pio

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "dashboard_estatico.html")

PATH_CON_ZONAS = os.path.join(DATA_DIR, "reportes_con_zonas.csv")
PATH_BASE = os.path.join(DATA_DIR, "reportes_sinteticos.csv")

DIAS_ORDEN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
DIAS_ES = {
    "Monday": "Lun", "Tuesday": "Mar", "Wednesday": "Mié", "Thursday": "Jue",
    "Friday": "Vie", "Saturday": "Sáb", "Sunday": "Dom",
}


def main():
    if os.path.exists(PATH_CON_ZONAS):
        df = pd.read_csv(PATH_CON_ZONAS, parse_dates=["created_at"])
        df["zona"] = df["zona"].astype(str)
        color_col = "zona"
    else:
        df = pd.read_csv(PATH_BASE, parse_dates=["created_at"])
        color_col = "categoria"

    mapa = px.scatter_map(
        df, lat="latitud", lon="longitud", color=color_col,
        hover_data=["categoria", "distrito", "estado"],
        zoom=9.5, height=520, title="Reportes por zona de riesgo",
    )
    mapa.update_layout(map_style="open-street-map", margin=dict(l=0, r=0, t=40, b=0))

    grafico_distrito = px.bar(
        df["distrito"].value_counts().sort_values().reset_index(),
        x="count", y="distrito", orientation="h", title="Reportes por distrito",
        labels={"count": "N° de reportes", "distrito": ""},
    )

    grafico_categoria = px.bar(
        df["categoria"].value_counts().sort_values().reset_index(),
        x="count", y="categoria", orientation="h", title="Reportes por tipo de incidente",
        labels={"count": "N° de reportes", "categoria": ""},
    )

    df["hora"] = df["created_at"].dt.hour
    df["dia"] = df["created_at"].dt.day_name()
    tabla_hora_dia = df.groupby(["dia", "hora"]).size().reset_index(name="n_reportes")
    grafico_hora_dia = px.density_heatmap(
        tabla_hora_dia, x="hora", y="dia", z="n_reportes",
        category_orders={"dia": DIAS_ORDEN}, color_continuous_scale="Reds",
        title="Incidentes por hora y día de la semana",
        labels={"hora": "Hora del día", "dia": "", "n_reportes": "N° de reportes"},
    )
    grafico_hora_dia.update_yaxes(ticktext=[DIAS_ES[d] for d in DIAS_ORDEN], tickvals=DIAS_ORDEN)

    tendencia = df.set_index("created_at").resample("W").size().reset_index(name="n_reportes")
    grafico_tendencia = px.line(
        tendencia, x="created_at", y="n_reportes", markers=True,
        title="Tendencia: reportes por semana",
        labels={"created_at": "Semana", "n_reportes": "N° de reportes"},
    )

    figuras = [mapa, grafico_distrito, grafico_categoria, grafico_hora_dia, grafico_tendencia]

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write("<title>AlertaSegura Perú — Dashboard (exportado)</title>")
        f.write(
            "<body style='font-family:sans-serif;max-width:1100px;margin:2rem auto;'>"
            "<h1>AlertaSegura Perú — Dashboard (vista estática)</h1>"
            f"<p>Total de reportes: {len(df)}. Generado sin filtros interactivos; "
            "para explorar con filtros usa <code>python scripts/dashboard_app.py</code>.</p>"
        )
        for i, fig in enumerate(figuras):
            f.write(pio.to_html(fig, full_html=False, include_plotlyjs="cdn" if i == 0 else False))
        f.write("</body>")

    print(f"Dashboard estático generado en: {OUT_PATH}")


if __name__ == "__main__":
    main()
