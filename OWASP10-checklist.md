# Checklist OWASP Top 10 

Búsqueda del top 10 en OWASP

Referencia oficial: https://owasp.org/www-project-top-ten/

## A01:2021 Control de acceso roto (Broken Access Control)

**Riesgo en este proyecto:** un ciudadano podría editar/eliminar reportes
de otros usuarios, o verificar reportes sin ser moderador.

## A02:2021 Fallas criptográficas (Cryptographic Failures)

**Riesgo en este proyecto:** contraseñas guardadas en texto plano o con
algoritmos débiles (MD5/SHA1); JWT_SECRET débil o expuesto en el repo.
Se debe plantear un hasheo de contraseñas, planteo que sea mediante bcrypt con 12 rounds.

## A03:2021 Inyección (Injection)

**Riesgo en este proyecto:** inyección SQL a través de los campos de
búsqueda/filtro (`distrito`, `categoria_id`) o de los campos de texto libre
del formulario de reporte u otros que puedan haber con entrada de texto.

## A04:2021 Diseño inseguro (Insecure Design)

**Riesgo en este proyecto:** no limitar la cantidad de reportes que un
usuario puede crear (habilita spam/vandalismo del mapa).

## A05:2021 Configuración de seguridad incorrecta (Security Misconfiguration)

**Riesgo en este proyecto:** exponer mensajes de error con detalles internos al cliente, dejar credenciales de ejemplo en `.env` committeadas al repo.

## A06:2021 Componentes vulnerables y desactualizados (Vulnerable Components)

**Riesgo en este proyecto:** dependencias de npm con vulnerabilidades conocidas(`bcrypt``jsonwebtoken`, `express`, etc.).

## A07:2021 Fallas de identificación y autenticación (Auth Failures)

**Riesgo en este proyecto:** fuerza bruta contra el login, contraseñas débiles permitidas en el registro, sesiones que nunca expiran(definir un tiempo en el que la sesión se cierre).
Contraseñas que incluya aunque sea un número y un caracter especial.

## A08:2021 Fallas de integridad de software y datos (Data Integrity Failures)

**Riesgo en este proyecto:** un reporte podría guardarse con una categoría
inexistente o un estado inválido si no hay validación a nivel de base de
datos, no solo de aplicación.

## A09:2021 Fallas de registro y monitoreo (Logging and Monitoring Failures)

**Riesgo en este proyecto:** no hay forma de detectar un ataque en curso o
investigar uno después de ocurrido, porque no queda registro.

## A10:2021 Server-Side Request Forgery (SSRF)

**Riesgo en este proyecto:** bajo, porque el backend no hace peticiones
salientes a URLs proporcionadas por el usuario (no hay funcionalidad de
"importar desde una URL" ni similar). Para este proyecto no aplica.

