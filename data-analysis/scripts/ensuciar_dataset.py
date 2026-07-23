"""
Genera una versión "sucia" del dataset sintético para poder probar el
script de limpieza (`limpieza_datos.py`) con problemas reales: nulos,
duplicados, formatos de fecha mixtos y texto con casing/espacios
inconsistentes.

Solo para Sprint 2 (testing del pipeline de limpieza). No reemplaza
`reportes_sinteticos.csv`, que sigue siendo el dataset "canónico" del
Sprint 1.
"""

import pandas as pd
import numpy as np

np.random.seed(7)

IN_PATH = "data-analysis/data/reportes_sinteticos.csv"
OUT_PATH = "data-analysis/data/reportes_sucios.csv"


def ensuciar(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # 1. Duplicar ~8 filas completas (simula doble envío del formulario)
    dupes = df.sample(8, random_state=7)
    df = pd.concat([df, dupes], ignore_index=True)

    # 2. Nulos en distrito, descripcion, estado y categoria
    for col, n in [("distrito", 6), ("descripcion", 3), ("estado", 5), ("categoria", 2)]:
        idx = df.sample(n, random_state=hash(col) % 1000).index
        df.loc[idx, col] = np.nan

    # 3. Casing / espacios inconsistentes en texto
    idx_upper = df.sample(10, random_state=1).index
    df.loc[idx_upper, "distrito"] = df.loc[idx_upper, "distrito"].str.upper()
    idx_spaces = df.sample(10, random_state=2).index
    df.loc[idx_spaces, "distrito"] = "  " + df.loc[idx_spaces, "distrito"].astype(str) + "  "
    idx_lower_cat = df.sample(8, random_state=3).index
    df.loc[idx_lower_cat, "categoria"] = df.loc[idx_lower_cat, "categoria"].str.lower()

    # 4. Fechas en formato distinto (dd/mm/yyyy) en vez de yyyy-mm-dd para
    #    simular un export mixto
    idx_fecha = df.sample(15, random_state=4).index
    df.loc[idx_fecha, "created_at"] = pd.to_datetime(
        df.loc[idx_fecha, "created_at"]
    ).dt.strftime("%d/%m/%Y %H:%M:%S")

    # 5. Coordenadas fuera de rango (error de digitación) para un par de filas
    idx_coord = df.sample(3, random_state=5).index
    df.loc[idx_coord, "latitud"] = df.loc[idx_coord, "latitud"] * 10

    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    return df


def main():
    df = pd.read_csv(IN_PATH)
    sucio = ensuciar(df)
    sucio.to_csv(OUT_PATH, index=False)
    print(f"Escrito {len(sucio)} filas (con problemas inyectados) -> {OUT_PATH}")


if __name__ == "__main__":
    main()
