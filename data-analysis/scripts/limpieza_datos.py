"""
Pipeline de limpieza para el dataset de reportes (AlertaSegura Perú).

Maneja los tres problemas típicos de un dataset ciudadano real:
- Nulos (algunos campos son obligatorios y otros se pueden imputar)
- Duplicados (doble envío del mismo reporte)
- Formatos inconsistentes (casing/espacios en texto, fechas mixtas,
  coordenadas fuera de rango)

Uso:
    python scripts/limpieza_datos.py                 # usa reportes_sucios.csv
    python scripts/limpieza_datos.py ruta/entrada.csv ruta/salida.csv
"""

import sys
import pandas as pd

# Bounding box aproximado de Lima Metropolitana + Callao, para detectar
# coordenadas con error de digitación (ej. lat/lon multiplicada por 10)
LAT_RANGE = (-13.0, -11.5)
LON_RANGE = (-77.3, -76.6)

CAMPOS_OBLIGATORIOS = ["categoria", "descripcion", "latitud", "longitud"]


def limpiar(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    reporte = {"filas_iniciales": len(df)}
    df = df.copy()

    # 1. Normalizar texto: quitar espacios y homogeneizar casing
    for col in ["distrito", "categoria", "descripcion", "estado"]:
        df[col] = df[col].astype("string").str.strip()
    df["distrito"] = (
        df["distrito"].str.title()
        .str.replace(r"\bDe\b", "de", regex=True)
        .str.replace(r"\bDel\b", "del", regex=True)
    )
    df["categoria"] = df["categoria"].str.title()

    # 2. Parsear fechas con formatos mixtos (ISO y dd/mm/yyyy)
    df["created_at"] = pd.to_datetime(df["created_at"], format="mixed", dayfirst=False, errors="coerce")
    reporte["fechas_invalidas"] = int(df["created_at"].isna().sum())

    # 3. Coordenadas fuera de rango -> se tratan como inválidas (NaN)
    fuera_rango = ~df["latitud"].between(*LAT_RANGE) | ~df["longitud"].between(*LON_RANGE)
    reporte["coordenadas_fuera_de_rango"] = int(fuera_rango.sum())
    df.loc[fuera_rango, ["latitud", "longitud"]] = pd.NA

    # 4. Duplicados exactos (mismo reporte enviado más de una vez)
    duplicados = df.duplicated(subset=[c for c in df.columns if c != "id"])
    reporte["duplicados_eliminados"] = int(duplicados.sum())
    df = df[~duplicados]

    # 5. Nulos: imputar donde tiene sentido, descartar donde el campo es obligatorio
    reporte["nulos_por_columna_antes"] = df.isnull().sum().to_dict()

    df["distrito"] = df["distrito"].fillna("Desconocido")
    df["estado"] = df["estado"].fillna("PENDIENTE")

    antes = len(df)
    df = df.dropna(subset=CAMPOS_OBLIGATORIOS + ["created_at"])
    reporte["filas_descartadas_por_nulos_obligatorios"] = antes - len(df)

    df = df.reset_index(drop=True)
    reporte["filas_finales"] = len(df)
    return df, reporte


def main():
    entrada = sys.argv[1] if len(sys.argv) > 1 else "data-analysis/data/reportes_sucios.csv"
    salida = sys.argv[2] if len(sys.argv) > 2 else "data-analysis/data/reportes_limpios.csv"

    df = pd.read_csv(entrada)
    limpio, reporte = limpiar(df)
    limpio.to_csv(salida, index=False)

    print(f"Entrada: {entrada} ({reporte['filas_iniciales']} filas)")
    print(f"Salida:  {salida} ({reporte['filas_finales']} filas)")
    print("--- Resumen de limpieza ---")
    for k, v in reporte.items():
        if k not in ("filas_iniciales", "filas_finales"):
            print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
