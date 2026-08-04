package com.alertasegura.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ReporteResponseDTO {

    private Long id;
    private String descripcion;
    private Double latitud;
    private Double longitud;
    private String distrito;
    private String estado;
    private String categoriaNombre;
    private String usuarioNombre;
    private LocalDateTime createdAt;
}