# Sprint 3
#WILLIAN GAYY

## Archivos incluidos aquí

- `tests_seguridad.js` — script con 10 pruebas de seguridad (inyección
  SQL, XSS, fuerza bruta, tokens manipulados, escalación de privilegios,
  enumeración de usuarios) ya adaptado al contrato del backend Java
  (`categoriaId` en vez de `categoria_id`)
- `correr_auditoria_zap.sh` — script para correr OWASP ZAP vía Docker
- `package.json` — dependencias mínimas para correr `tests_seguridad.js`

## Cómo correrlo

```bash
# Terminal 1: levantar el backend real
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2: correr los tests de seguridad
cd seguridad
node tests_seguridad.js

# Opcional: escaneo con OWASP ZAP (requiere Docker instalado)
./correr_auditoria_zap.sh
```
