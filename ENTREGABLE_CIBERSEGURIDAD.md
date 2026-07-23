# Entregable de Ciberseguridad Sprint 1 

Checklist original del sprint:
- Esquema de autenticación JWT definido
- Checklist OWASP Top 10 adaptado al proyecto
- Variables de entorno definidas 

## 1. Esquema de autenticación JWT

**Archivo:** `backend/src/main/java/com/alertasegura/security/JwtUtil.java`

Decisiones tomadas y documentadas para el equipo:

| Decisión | Valor | Por qué |

-Algoritmo de hash para contraseñas, bcrypt, 12 rounds porque es lento a propósito y por ello resiste fuerza bruta mejor que MD5/SHA. Configurado como bean `PasswordEncoder` en `SecurityConfig.java` 

-Algoritmo de firma del JWT | HS256 (HMAC-SHA256) | Estándar, requiere que `jwt.secret` tenga al menos 256 bits 

-Payload del JWT, `subject = userId`, `claim "rol"` porque: mínimo necesario, nunca datos sensibles en el token.

-Expiración del JWT, 24h (`JWT_EXPIRATION_MS=86400000`, configurable) Porque tiene balance entre seguridad y no forzar re-login constante.

-Transporte del token, Header `Authorization: Bearer <token>` Es estándar, evita problemas de CSRF que sí tienen las cookies.

-Roles soportados como `ciudadano`, `moderador` son mapeados a `ROLE_CIUDADANO` / `ROLE_MODERADOR` para Spring Security.

Código clave y generación y validación del token:

```java
public String generarToken(Long userId, String rol) {
    Date ahora = new Date();
    Date expiracion = new Date(ahora.getTime() + expirationMs);

    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("rol", rol)
        .issuedAt(ahora)
        .expiration(expiracion)
        .signWith(clave())
        .compact();
}

public Claims validarYExtraer(String token) {
    // Lanza excepcion si la firma no coincide o el token expiro
    return Jwts.parser()
        .verifyWith(clave())
        .build()
        .parseSignedClaims(token)
        .getPayload();
}
```

**Cómo se conecta con el resto de la seguridad:** `JwtUtil` es usado por
`JwtAuthFilter` (intercepta cada petición HTTP y valida el token) y por
`AuthService` (genera el token al hacer login o registro). La separación
entre "quién eres" (autenticación, `JwtAuthFilter`) y "qué puedes hacer"
(autorización, `SecurityConfig` + `ReporteService.verificarPermisoEdicion`).
Archivos que se van a implementar en los siguientes sprints

## 2. Checklist OWASP Top 10 adaptado

Traduce cada uno de los 10 riesgos del estándar OWASP a un riesgo concreto
de AlertaSegura Perú, indicando en qué sprint se implementa la protección y
en cuál se verifica. Este documento no depende del lenguaje del
backend sino q describe riesgos y decisiones de diseño.

Resumen rápido — de los 10 ítems:
- **7 aplican y están cubiertos** en el diseño del proyecto (A01, A02,
  A03, A04, A05 parcial, A07, A08)
- **2 quedan como trabajo futuro**, documentados explícitamente (A06
  auditoría continua de dependencias, A09 logging estructurado)
- **1 no aplica** al diseño actual (A10 SSRF)

Para A06 en esta versión Java, el equivalente a `npm audit` es:
```bash
mvn org.owasp:dependency-check-maven:check
```

## 3. Variables de entorno

Spring Boot la configuración vive en
`application.properties`

**Archivo:** `backend/src/main/resources/application-example.properties`

Y se inyectan en el código Java con `@Value`:
```java
@Value("${jwt.secret}")
private String secret;
```

### Flujo de trabajo del equipo
1. Cada integrante copia `application-example.properties` →
   `application-dev.properties` y pone sus valores reales
2. `application-dev.properties` **nunca se sube al repo** — ya está en
   `.gitignore` (raíz del proyecto y `backend/.gitignore`)
3. Se corre con el perfil activo
4. Si un secreto se filtra por error, se rota inmediatamente (generar uno
   nuevo con `openssl rand -hex 32` y redistribuirlo de forma segura)

