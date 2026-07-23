package com.alertasegura.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import com.alertasegura.backend.model.Reporte;

@Getter
@Setter
public class ReporteEstadoUpdateDTO {

    @NotNull(message = "El estado es obligatorio")
    private Reporte.Estado estado;
}