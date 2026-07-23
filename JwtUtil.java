package com.alertasegura.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey clave() {
        // La clave debe tener al menos 256 bits para HS256 - por eso el JWT_SECRET real (no el placeholder) debe ser largo y aleatorio.
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

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
        // jwt.parser().verifyWith(...).parseSignedClaims() lanza excepcion
        // si la firma no coincide o el token expiro, equivalente exacto
        return Jwts.parser()
            .verifyWith(clave())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public Long extraerUserId(Claims claims) {
        return Long.valueOf(claims.getSubject());
    }

    public String extraerRol(Claims claims) {
        return claims.get("rol", String.class);
    }
}
