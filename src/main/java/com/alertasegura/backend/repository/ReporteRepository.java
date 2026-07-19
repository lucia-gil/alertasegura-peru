package com.alertasegura.backend.repository;

import com.alertasegura.backend.model.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReporteRepository extends JpaRepository<Reporte, Long> {

    List<Reporte> findByDistrito(String distrito);

    List<Reporte> findByCategoriaId(Long categoriaId);
}