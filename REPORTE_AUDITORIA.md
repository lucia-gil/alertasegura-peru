# Reporte de Auditoría de Seguridad analizado hasta ahora

**Acción requerida del equipo:** correr `node tests_seguridad.js` contra
el backend Spring Boot real (`mvn spring-boot:run`) y actualizar la tabla
de resultados de este documento con los datos reales. Es el mismo script
ya usado y verificado contra la versión Node, ajustado solo en el nombre
del campo `categoriaId` (ver seguridad/tests_seguridad.js).

## Diseño de seguridad implementado (por construcción, pendiente de verificar)

| # | Protección | Dónde vive en el código | Mecanismo |
|---|---|---|---|
| 1 | Inyección SQL | `repository/*.java` | JPA/Hibernate + Specifications — SQL siempre parametrizado, nunca concatenado |
| 2 | XSS | Fuera del backend (frontend) | Backend no sanitiza (correcto); React escapa al renderizar |
| 3 | Fuerza bruta | `security/RateLimiter.java` + `RateLimitFilter.java` | Máx. 5 intentos/15min en login, contador en memoria por IP |
| 4 | Autenticación | `security/JwtUtil.java` + `JwtAuthFilter.java` | JWT firmado con HS256, verificado en cada petición |
| 5 | Hashing de contraseñas | `config/SecurityConfig.java` (bean `PasswordEncoder`) | bcrypt, 12 rounds — mismo costo que la versión Node |
| 6 | Autorización por rol | `SecurityConfig.java` (`.hasRole("MODERADOR")`) | Spring Security exige rol antes de llegar al controlador |
| 7 | Autorización por dueño | `service/ReporteService.java` (`verificarPermisoEdicion`) | Lógica de negocio explícita, no delegada solo a Spring Security |
| 8 | Validación de rangos | `dto/ReporteDtos.java` (`@DecimalMin`/`@DecimalMax`) | Bean Validation rechaza antes de llegar al service |
| 9 | Política de contraseñas | `dto/AuthDtos.java` (`@Size`, `@Pattern`) | Mínimo 8 caracteres + al menos un número |
| 10 | Enumeración de usuarios | `service/AuthService.java` (método `login`) | Mismo mensaje de error para email inexistente y password incorrecta |
## Checklist OWASP: estado en esta versión

Igual que en `sprints/sprint1-fundamentos/owasp-checklist.md` (que aplica a
ambas versiones del backend por igual, ya que describe riesgos y decisiones
de diseño, no código específico de un lenguaje). Los ítems A06 (componentes
vulnerables) y A09 (logging) siguen pendientes en esta versión también.

Para A06 en Maven, el comando equivalente a `npm audit` es:
```bash
mvn org.owasp:dependency-check-maven:check
```
Se requiere agregar el plugin `dependency-check-maven` al `pom.xml` si decidimos usarlo, no está incluido por defecto para no añadir peso al build.

## Ejecución:

```bash
# Terminal 1
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2
cd seguridad
node tests_seguridad.js
```

