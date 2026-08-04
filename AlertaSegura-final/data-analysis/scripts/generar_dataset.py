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
    "Robo": ["Sustrajeron mi celular en la calle", "Robaron una tienda cerca de mi casa", "Me quitaron la mochila en el paradero"],
    "Extorsión": ["Llamada exigiendo pago a cambio de 'seguridad'", "Amenaza a comerciante local", "Cobro de cupo a transportista"],
    "Bache": ["Bache grande en plena avenida", "Pista deteriorada genera accidentes", "Hueco profundo sin señalizar"],
    "Alumbrado deficiente": ["Poste sin luz hace varias semanas", "Cuadra completamente oscura de noche", "Farol malogrado en el parque"],
    "Acoso": ["Un sujeto acosó a una mujer en la vereda", "Comentarios y seguimiento a una persona en la calle", "Acoso a estudiantes cerca del colegio"],
}

N_USUARIOS = 40
N_REPORTES = 120


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


def generar_reportes(usuarios, categorias):
    reportes = []
    inicio = datetime(2026, 5, 1)
    for i in range(1, N_REPORTES + 1):
        usuario = random.choice(usuarios)
        cat_nombre, _ = random.choice(CATEGORIAS)
        distrito = random.choice(list(DISTRITOS.keys()))
        lat_base, lon_base = DISTRITOS[distrito]
        # jitter pequeño para no repetir exactamente el centroide del distrito
        lat = lat_base + random.uniform(-0.01, 0.01)
        lon = lon_base + random.uniform(-0.01, 0.01)

        dia_random = inicio + timedelta(days=random.randint(0, 83))
        hora = hora_sesgada()
        minuto = random.randint(0, 59)
        created_at = dia_random.replace(hour=hora, minute=minuto, second=0)

        estado = random.choices(ESTADOS, weights=ESTADO_PESOS, k=1)[0]

        reportes.append({
            "id": i,
            "usuario_id": usuario["id"],
            "categoria": cat_nombre,
            "descripcion": random.choice(DESCRIPCIONES[cat_nombre]),
            "latitud": round(lat, 6),
            "longitud": round(lon, 6),
            "distrito": distrito,
            "estado": estado,
            "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S"),
        })
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
