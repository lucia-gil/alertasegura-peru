package com.alertasegura.backend.controller;

import com.alertasegura.backend.dto.AuthResponseDTO;
import com.alertasegura.backend.dto.LoginRequestDTO;
import com.alertasegura.backend.dto.RegisterRequestDTO;
import com.alertasegura.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController //dice a Spring que esta clase maneja peticiones HTTP y devuelve JSON directamente
@RequestMapping("/api/auth") //el prefijo base de todas las rutas de esta clase
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    //responde a POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}