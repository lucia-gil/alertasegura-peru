package com.alertasegura.controller;

import com.alertasegura.repository.CategoriaRepository;
import com.alertasegura.entity.Categoria;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Para probar el flujo completo
 * (registro, login, roles, validacion, CRUD, proteccion contra SQLi) contra
 * la aplicacion real levantada en memoria con H2, usando MockMvc para
 * simular peticiones HTTP reales sin necesitar un servidor corriendo.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @BeforeEach
    void seedCategorias() {
        if (categoriaRepository.count() == 0) {
            for (String nombre : new String[]{"robo", "extorsion", "bache", "alumbrado_publico", "otro"}) {
                Categoria c = new Categoria();
                c.setNombre(nombre);
                categoriaRepository.save(c);
            }
        }
    }

    @Test
    void healthCheckResponde200() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void registroExitosoDevuelve201YToken() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
            "nombre", "Rosell Test", "email", "rosell@test.com", "password", "clave1234"
        ));

        mockMvc.perform(post("/api/auth/register").contentType("application/json").content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.usuario.email").value("rosell@test.com"));
    }

    @Test
    void registroConPasswordDebilResponde400() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
            "nombre", "Otro", "email", "otro@test.com", "password", "abc"
        ));

        mockMvc.perform(post("/api/auth/register").contentType("application/json").content(body))
            .andExpect(status().isBadRequest());
    }

    @Test
    void registroConEmailDuplicadoResponde409() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
            "nombre", "Dup", "email", "dup@test.com", "password", "clave1234"
        ));
        mockMvc.perform(post("/api/auth/register").contentType("application/json").content(body));

        mockMvc.perform(post("/api/auth/register").contentType("application/json").content(body))
            .andExpect(status().isConflict());
    }

    @Test
    void loginCorrectoDevuelve200YToken() throws Exception {
        registrarUsuarioDePrueba("login@test.com", "clave1234");

        String body = objectMapper.writeValueAsString(Map.of("email", "login@test.com", "password", "clave1234"));
        mockMvc.perform(post("/api/auth/login").contentType("application/json").content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void loginConPasswordIncorrectaResponde401() throws Exception {
        registrarUsuarioDePrueba("login2@test.com", "clave1234");

        String body = objectMapper.writeValueAsString(Map.of("email", "login2@test.com", "password", "incorrecta"));
        mockMvc.perform(post("/api/auth/login").contentType("application/json").content(body))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void perfilSinTokenResponde401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void perfilConTokenValidoDevuelveUsuario() throws Exception {
        String token = registrarUsuarioDePrueba("perfil@test.com", "clave1234");

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("perfil@test.com"));
    }

    @Test
    void listarCategoriasDevuelveLasCinco() throws Exception {
        mockMvc.perform(get("/api/categorias"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(5));
    }

    @Test
    void crearReporteAutenticadoResponde201() throws Exception {
        String token = registrarUsuarioDePrueba("reporte@test.com", "clave1234");

        String body = objectMapper.writeValueAsString(Map.of(
            "titulo", "Robo de celular en la esquina",
            "categoriaId", 1,
            "distrito", "Miraflores",
            "latitud", -12.1211,
            "longitud", -77.0294
        ));

        mockMvc.perform(post("/api/reportes").header("Authorization", "Bearer " + token)
                .contentType("application/json").content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.estado").value("pendiente"));
    }

    @Test
    void crearReporteSinAutenticacionResponde401() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
            "titulo", "Reporte sin auth", "categoriaId", 1,
            "distrito", "Miraflores", "latitud", -12.12, "longitud", -77.02
        ));

        mockMvc.perform(post("/api/reportes").contentType("application/json").content(body))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void crearReporteConLatitudInvalidaResponde400() throws Exception {
        String token = registrarUsuarioDePrueba("latinvalida@test.com", "clave1234");

        String body = objectMapper.writeValueAsString(Map.of(
            "titulo", "Latitud fuera de rango", "categoriaId", 1,
            "distrito", "Miraflores", "latitud", 999, "longitud", -77.02
        ));

        mockMvc.perform(post("/api/reportes").header("Authorization", "Bearer " + token)
                .contentType("application/json").content(body))
            .andExpect(status().isBadRequest());
    }

    @Test
    void listarReportesDevuelveLosCreados() throws Exception {
        String token = registrarUsuarioDePrueba("listar@test.com", "clave1234");
        crearReporteDePrueba(token, "Listar - reporte 1", "Comas");

        mockMvc.perform(get("/api/reportes"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].categoria").value("robo"));
    }

    @Test
    void filtrarReportesPorDistritoFunciona() throws Exception {
        String token = registrarUsuarioDePrueba("filtro@test.com", "clave1234");
        crearReporteDePrueba(token, "Filtro - reporte", "DistritoUnicoTest");

        mockMvc.perform(get("/api/reportes").param("distrito", "DistritoUnicoTest"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void ciudadanoNoPuedeVerificarReporteResponde403() throws Exception {
        String token = registrarUsuarioDePrueba("noverificador@test.com", "clave1234");
        Long reporteId = crearReporteDePruebaYObtenerId(token, "No verificador - reporte", "Ate");

        mockMvc.perform(patch("/api/reportes/" + reporteId + "/verificar")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    void intentoDeInyeccionSqlEnFiltroNoRompeLaQuery() throws Exception {
        mockMvc.perform(get("/api/reportes").param("distrito", "x' OR '1'='1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void tokenConFirmaAlteradaResponde401() throws Exception {
        String token = registrarUsuarioDePrueba("tokenmalo@test.com", "clave1234");
        String tokenAlterado = token.substring(0, token.length() - 5) + "XXXXX";

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + tokenAlterado))
            .andExpect(status().isUnauthorized());
    }

    // --- Helpers ---

    private String registrarUsuarioDePrueba(String email, String password) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
            "nombre", "Usuario Test", "email", email, "password", password
        ));
        MvcResult result = mockMvc.perform(post("/api/auth/register").contentType("application/json").content(body))
            .andReturn();
        Map<?, ?> response = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return (String) response.get("token");
    }

    private void crearReporteDePrueba(String token, String titulo, String distrito) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
            "titulo", titulo, "categoriaId", 1, "distrito", distrito,
            "latitud", -12.1, "longitud", -77.0
        ));
        mockMvc.perform(post("/api/reportes").header("Authorization", "Bearer " + token)
            .contentType("application/json").content(body));
    }

    private Long crearReporteDePruebaYObtenerId(String token, String titulo, String distrito) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
            "titulo", titulo, "categoriaId", 1, "distrito", distrito,
            "latitud", -12.1, "longitud", -77.0
        ));
        MvcResult result = mockMvc.perform(post("/api/reportes").header("Authorization", "Bearer " + token)
                .contentType("application/json").content(body))
            .andReturn();
        Map<?, ?> response = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        return Long.valueOf(response.get("id").toString());
    }
}
