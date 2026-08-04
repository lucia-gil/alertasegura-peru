package com.alertasegura.backend.service;

import com.alertasegura.backend.dto.ReporteRequestDTO;
import com.alertasegura.backend.dto.ReporteResponseDTO;
import com.alertasegura.backend.model.Categoria;
import com.alertasegura.backend.model.Reporte;
import com.alertasegura.backend.model.Usuario;
import com.alertasegura.backend.repository.CategoriaRepository;
import com.alertasegura.backend.repository.ReporteRepository;
import com.alertasegura.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReporteService {

    private final ReporteRepository reporteRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public ReporteService(
            ReporteRepository reporteRepository,
            CategoriaRepository categoriaRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.reporteRepository = reporteRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public ReporteResponseDTO crearReporte(ReporteRequestDTO request, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

        Reporte reporte = new Reporte();
        reporte.setUsuario(usuario);
        reporte.setCategoria(categoria);
        reporte.setDescripcion(request.getDescripcion());
        reporte.setLatitud(request.getLatitud());
        reporte.setLongitud(request.getLongitud());
        reporte.setDistrito(request.getDistrito());
        // estado se fuerza a PENDIENTE automáticamente en @PrePersist de la entidad

        Reporte guardado = reporteRepository.save(reporte);
        return toResponseDTO(guardado);
    }

    public List<ReporteResponseDTO> listarTodos() {
        return reporteRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public ReporteResponseDTO obtenerPorId(Long id) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reporte no encontrado"));
        return toResponseDTO(reporte);
    }

    public List<ReporteResponseDTO> listarPorDistrito(String distrito) {
        return reporteRepository.findByDistrito(distrito)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public ReporteResponseDTO actualizarEstado(Long id, Reporte.Estado nuevoEstado) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reporte no encontrado"));

        reporte.setEstado(nuevoEstado);
        Reporte actualizado = reporteRepository.save(reporte);
        return toResponseDTO(actualizado);
    }

    public void eliminarReporte(Long id) {
        if (!reporteRepository.existsById(id)) {
            throw new IllegalArgumentException("Reporte no encontrado");
        }
        reporteRepository.deleteById(id);
    }

    private ReporteResponseDTO toResponseDTO(Reporte reporte) {
        return new ReporteResponseDTO(
                reporte.getId(),
                reporte.getDescripcion(),
                reporte.getLatitud(),
                reporte.getLongitud(),
                reporte.getDistrito(),
                reporte.getEstado().name(),
                reporte.getCategoria().getNombre(),
                reporte.getUsuario().getNombre(),
                reporte.getCreatedAt()
        );
    }


}