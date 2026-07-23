"""
Genera un dataset sintético de reportes ciudadanos para AlertaSegura Perú.

Sigue el esquema de las entidades JPA del backend
(Usuario, Categoria, Reporte) para que el análisis pueda migrar
directamente a datos reales en el Sprint 2.

No requiere librerías externas: solo la librería estándar de Python.
"""

import csv
import random
from datetime import datetime, timedelta

random.seed(42)

OUT_DIR = "data-analysis/data"

# --- Distritos de Lima Metropolitana con coordenadas aproximadas (centroide) ---
DISTRITOS = {
    "San Juan de Lurigancho": (-11.9739, -77.0074),
    "San Martín de Porres": (-11.9822, -77.0850),
    "Ate": (-12.0333, -76.9167),
    "Comas": (-11.9358, -77.0458),
    "Villa El Salvador": (-12.2167, -76.9333),
    "San Juan de Miraflores": (-12.1583, -76.9689),
    "Los Olivos": (-11.9689, -77.0708),
    "Villa María del Triunfo": (-12.1611, -76.9350),
    "Puente Piedra": (-11.8672, -77.0764),
    "Chorrillos": (-12.1750, -77.0208),
    "Surco": (-12.1350, -76.9931),
    "San Isidro": (-12.0964, -77.0350),
    "Miraflores": (-12.1211, -77.0300),
    "La Victoria": (-12.0658, -77.0197),
    "Cercado de Lima": (-12.0464, -77.0428),
    "Callao": (-12.0561, -77.1181),
    "Independencia": (-11.9908, -77.0500),
    "Rímac": (-12.0289, -77.0322),
}

# --- Categorías de incidente: EXACTAS a las ya insertadas en la tabla `categorias` real (ids 1-5) ---
CATEGORIAS = [
    ("Robo", "Robo o asalto a mano armada"),
    ("Extorsión", "Amenazas o cobro de cupos"),
    ("Bache", "Deterioro de la vía pública"),
    ("Alumbrado deficiente", "Falta o falla de luminarias públicas"),
    ("Acoso", "Acoso callejero o similar"),
]

ESTADOS = ["PENDIENTE", "VERIFICADO", "RECHAZADO"]
ESTADO_PESOS = [0.5, 0.4, 0.1]

DESCRIPCIONES = {
    "Robo": [
        "Sustrajeron mi celular en la calle", "Robaron una tienda cerca de mi casa",
        "Me quitaron la mochila en el paradero", "Robo a mano armada a un transeúnte",
        "Sustracción de autopartes en la cuadra",
    ],
    "Extorsión": [
        "Llamada exigiendo pago a cambio de 'seguridad'", "Amenaza a comerciante local",
        "Cobro de cupo a transportista", "Nota de extorsión dejada en el negocio",
    ],
    "Bache": [
        "Bache grande en plena avenida", "Pista deteriorada genera accidentes",
        "Hueco profundo sin señalizar", "Vía con múltiples baches tras las lluvias",
    ],
    "Alumbrado deficiente": [
        "Poste sin luz hace varias semanas", "Cuadra completamente oscura de noche",
        "Farol malogrado en el parque", "Falta de iluminación en el paradero",
    ],
    "Acoso": [
        "Un sujeto acosó a una mujer en la vereda", "Comentarios y seguimiento a una persona en la calle",
        "Acoso a estudiantes cerca del colegio", "Acoso callejero reiterado en la misma zona",
    ],
}

# --- Perfil de riesgo por distrito: pesos relativos por categoría, para que
#     el dataset no sea uniforme al azar sino que tenga patrones plausibles
#     (más baches/alumbrado en distritos periféricos, más acoso/extorsión en
#     zonas comerciales densas, etc). Son valores ilustrativos, no cifras
#     reales de criminalidad. ---
PERFIL_DISTRITO = {
    # distritos periféricos: más baches, alumbrado deficiente y robo
    "San Juan de Lurigancho": {"Bache": 3, "Alumbrado deficiente": 3, "Robo": 3, "Extorsión": 1, "Acoso": 1},
    "Comas": {"Bache": 3, "Alumbrado deficiente": 3, "Robo": 2, "Extorsión": 1, "Acoso": 1},
    "Villa El Salvador": {"Bache": 3, "Alumbrado deficiente": 2, "Robo": 2, "Extorsión": 2, "Acoso": 1},
    "Villa María del Triunfo": {"Bache": 3, "Alumbrado deficiente": 3, "Robo": 2, "Extorsión": 1, "Acoso": 1},
    "San Juan de Miraflores": {"Bache": 2, "Alumbrado deficiente": 2, "Robo": 2, "Extorsión": 1, "Acoso": 1},
    "Puente Piedra": {"Bache": 3, "Alumbrado deficiente": 3, "Robo": 2, "Extorsión": 1, "Acoso": 1},
    "Independencia": {"Bache": 2, "Alumbrado deficiente": 2, "Robo": 2, "Extorsión": 1, "Acoso": 1},
    "San Martín de Porres": {"Bache": 2, "Alumbrado deficiente": 2, "Robo": 2, "Extorsión": 1, "Acoso": 1},
    "Los Olivos": {"Bache": 2, "Alumbrado deficiente": 2, "Robo": 2, "Extorsión": 1, "Acoso": 1},
    "Ate": {"Bache": 2, "Alumbrado deficiente": 2, "Robo": 2, "Extorsión": 2, "Acoso": 1},
    # zonas comerciales/con más tránsito peatonal: más acoso y extorsión a comerciantes
    "La Victoria": {"Bache": 1, "Alumbrado deficiente": 1, "Robo": 2, "Extorsión": 3, "Acoso": 2},
    "Cercado de Lima": {"Bache": 1, "Alumbrado deficiente": 1, "Robo": 2, "Extorsión": 2, "Acoso": 3},
    "Callao": {"Bache": 2, "Alumbrado deficiente": 2, "Robo": 2, "Extorsión": 3, "Acoso": 1},
    "Rímac": {"Bache": 2, "Alumbrado deficiente": 1, "Robo": 2, "Extorsión": 2, "Acoso": 1},
    # distritos residenciales de mayor ingreso: menos reportes en general, más robo/acoso puntual
    "San Isidro": {"Bache": 1, "Alumbrado deficiente": 1, "Robo": 2, "Extorsión": 1, "Acoso": 1},
    "Miraflores": {"Bache": 1, "Alumbrado deficiente": 1, "Robo": 2, "Extorsión": 1, "Acoso": 2},
    "Surco": {"Bache": 1, "Alumbrado deficiente": 1, "Robo": 1, "Extorsión": 1, "Acoso": 1},
    "Chorrillos": {"Bache": 2, "Alumbrado deficiente": 1, "Robo": 2, "Extorsión": 1, "Acoso": 1},
}

N_USUARIOS = 55
N_REPORTES = 220
N_HOTSPOTS = 6          # zonas con reportes recurrentes (mismo problema reportado varias veces)
REPORTES_POR_HOTSPOT = (4, 9)


def generar_usuarios():
    usuarios = []
    for i in range(1, N_USUARIOS + 1):
        rol = "MODERADOR" if i <= 4 else "CIUDADANO"  # pocos moderadores, como en la vida real
        created_at = datetime(2026, 1, 1) + timedelta(days=random.randint(0, 200))
        usuarios.append({
            "id": i,
            "nombre": f"Usuario {i}",
            "email": f"usuario{i}@correo.pe",
            "rol": rol,
            "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S"),
        })
    return usuarios


def generar_categorias():
    return [
        {"id": i, "nombre": nombre, "descripcion": desc}
        for i, (nombre, desc) in enumerate(CATEGORIAS, start=1)
    ]


def hora_sesgada():
    """Más reportes en la noche/madrugada, como suele pasar con incidentes de seguridad."""
    franjas = list(range(24))
    pesos = [3 if (h >= 19 or h <= 4) else 1 for h in franjas]
    return random.choices(franjas, weights=pesos, k=1)[0]


def elegir_categoria(distrito):
    perfil = PERFIL_DISTRITO.get(distrito, {})
    nombres = [c[0] for c in CATEGORIAS]
    pesos = [perfil.get(n, 1) for n in nombres]
    return random.choices(nombres, weights=pesos, k=1)[0]


def _crear_reporte(i, usuario_id, categoria, distrito, lat, lon, dia_base, rango_dias):
    hora = hora_sesgada()
    minuto = random.randint(0, 59)
    dia_random = dia_base + timedelta(days=random.randint(0, rango_dias))
    created_at = dia_random.replace(hour=hora, minute=minuto, second=0)
    estado = random.choices(ESTADOS, weights=ESTADO_PESOS, k=1)[0]

    return {
        "id": i,
        "usuario_id": usuario_id,
        "categoria": categoria,
        "descripcion": random.choice(DESCRIPCIONES[categoria]),
        "latitud": round(lat, 6),
        "longitud": round(lon, 6),
        "distrito": distrito,
        "estado": estado,
        "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S"),
    }


def generar_reportes(usuarios, categorias):
    reportes = []
    inicio = datetime(2026, 5, 1)
    rango_dias = 83
    siguiente_id = 1

    # 1. Hotspots: mismo punto (o muy cercano) con varios reportes de la
    #    misma categoría, simulando un problema recurrente en esa zona
    #    (ej. un poste malogrado reportado por varios vecinos).
    n_hotspot_reportes = 0
    for _ in range(N_HOTSPOTS):
        distrito = random.choice(list(DISTRITOS.keys()))
        categoria = elegir_categoria(distrito)
        lat_base, lon_base = DISTRITOS[distrito]
        punto_lat = lat_base + random.uniform(-0.008, 0.008)
        punto_lon = lon_base + random.uniform(-0.008, 0.008)
        n_reportes_hotspot = random.randint(*REPORTES_POR_HOTSPOT)

        for _ in range(n_reportes_hotspot):
            usuario = random.choice(usuarios)
            lat = punto_lat + random.uniform(-0.0015, 0.0015)
            lon = punto_lon + random.uniform(-0.0015, 0.0015)
            reportes.append(_crear_reporte(
                siguiente_id, usuario["id"], categoria, distrito, lat, lon, inicio, rango_dias,
            ))
            siguiente_id += 1
            n_hotspot_reportes += 1

    # 2. Resto de reportes: distribuidos por distrito según su perfil de riesgo
    for _ in range(N_REPORTES - n_hotspot_reportes):
        usuario = random.choice(usuarios)
        distrito = random.choice(list(DISTRITOS.keys()))
        categoria = elegir_categoria(distrito)
        lat_base, lon_base = DISTRITOS[distrito]
        lat = lat_base + random.uniform(-0.01, 0.01)
        lon = lon_base + random.uniform(-0.01, 0.01)

        reportes.append(_crear_reporte(
            siguiente_id, usuario["id"], categoria, distrito, lat, lon, inicio, rango_dias,
        ))
        siguiente_id += 1

    random.shuffle(reportes)
    for nuevo_id, r in enumerate(reportes, start=1):
        r["id"] = nuevo_id
    return reportes


def escribir_csv(path, filas, columnas):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columnas)
        writer.writeheader()
        writer.writerows(filas)
    print(f"Escrito {len(filas)} filas -> {path}")


def main():
    usuarios = generar_usuarios()
    categorias = generar_categorias()
    reportes = generar_reportes(usuarios, categorias)

    escribir_csv(f"{OUT_DIR}/usuarios.csv", usuarios, ["id", "nombre", "email", "rol", "created_at"])
    escribir_csv(f"{OUT_DIR}/categorias.csv", categorias, ["id", "nombre", "descripcion"])
    escribir_csv(f"{OUT_DIR}/reportes_sinteticos.csv", reportes,
                 ["id", "usuario_id", "categoria", "descripcion", "latitud", "longitud", "distrito", "estado", "created_at"])


if __name__ == "__main__":
    main()
