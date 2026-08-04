package com.alertasegura.backend.controller;

import com.alertasegura.backend.dto.ReporteEstadoUpdateDTO;
import com.alertasegura.backend.dto.ReporteRequestDTO;
import com.alertasegura.backend.dto.ReporteResponseDTO;
import com.alertasegura.backend.service.ReporteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @PostMapping
    public ResponseEntity<ReporteResponseDTO> crear(
            @Valid @RequestBody ReporteRequestDTO request,
            Authentication authentication
    ) {
        String emailUsuario = authentication.getName();
        ReporteResponseDTO response = reporteService.crearReporte(request, emailUsuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ReporteResponseDTO>> listarTodos(
            @RequestParam(required = false) String distrito
    ) {
        if (distrito != null && !distrito.isBlank()) {
            return ResponseEntity.ok(reporteService.listarPorDistrito(distrito));
        }
        return ResponseEntity.ok(reporteService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReporteResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(reporteService.obtenerPorId(id));
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('MODERADOR')")
    public ResponseEntity<ReporteResponseDTO> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ReporteEstadoUpdateDTO request
    ) {
        ReporteResponseDTO response = reporteService.actualizarEstado(id, request.getEstado());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MODERADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        reporteService.eliminarReporte(id);
        return ResponseEntity.noContent().build();
    }
}