package com.alertasegura.backend.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;


import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        boolean esLogin = path.equals("/api/auth/login") && method.equals("POST");
        boolean esCrearReporte = path.equals("/api/reportes") && method.equals("POST");

        if (esLogin || esCrearReporte) {
            String ip = request.getRemoteAddr();
            String key = ip + ":" + path;

            Bucket bucket = buckets.computeIfAbsent(key, k -> crearBucket(esLogin));

            if (!bucket.tryConsume(1)) {
                response.setStatus(429); // Too Many Requests
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"Demasiadas solicitudes, intenta más tarde\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private Bucket crearBucket(boolean esLogin) {
        // Login: máximo 5 intentos por minuto (anti fuerza bruta)
        // Crear reporte: máximo 10 por minuto (anti spam)
        int capacidad = esLogin ? 5 : 10;
        Bandwidth limite = Bandwidth.classic(capacidad, Refill.greedy(capacidad, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limite).build();
    }
}