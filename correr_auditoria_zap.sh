#!/bin/bash
# Auditoría automatizada con OWASP ZAP contra el backend corriendo localmente.
#
# Requisitos: Docker instalado (la forma más simple de correr ZAP sin instalarlo)
# El backend debe estar corriendo en http://localhost:4000 antes de ejecutar esto.
#
# Uso:
#   chmod +x correr_auditoria_zap.sh
#   ./correr_auditoria_zap.sh

set -e

TARGET="http://host.docker.internal:4000"
REPORTE_DIR="./reportes-zap"
mkdir -p "$REPORTE_DIR"

echo "Verificando que el backend esté corriendo..."
curl -sf http://localhost:4000/api/health > /dev/null || {
  echo "ERROR: el backend no responde en http://localhost:4000/api/health"
  echo "Levántalo primero con: cd ../backend && npm start"
  exit 1
}

echo "Corriendo ZAP Baseline Scan (pasivo, rápido, seguro contra apps en desarrollo)..."
docker run --rm \
  -v "$(pwd)/$REPORTE_DIR:/zap/wrk:rw" \
  -t zaproxy/zap-stable zap-baseline.py \
  -t "$TARGET" \
  -r reporte-baseline.html \
  -J reporte-baseline.json \
  -I

echo ""
echo "Reporte generado en: $REPORTE_DIR/reporte-baseline.html"
echo ""
echo "Para un escaneo más profundo (activo, incluye intentos de explotación —"
echo "solo contra tu propia app en local, nunca contra apps de terceros):"
echo ""
echo "  docker run --rm -v \"\$(pwd)/$REPORTE_DIR:/zap/wrk:rw\" -t zaproxy/zap-stable \\"
echo "    zap-full-scan.py -t $TARGET -r reporte-full.html -I"
