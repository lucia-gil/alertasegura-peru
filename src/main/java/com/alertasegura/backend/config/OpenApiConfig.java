package com.alertasegura.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
//Entrar a: http://localhost:8080/swagger-ui/index.html
// http://localhost:8080/swagger-ui.html
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI alertaseguraOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AlertaSegura Perú API")
                        .description("API de reportes ciudadanos con análisis de riesgo por zona")
                        .version("v1.0"));
    }
}