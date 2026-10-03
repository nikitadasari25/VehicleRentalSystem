package com.example.content_service.config;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(
                        new Info()
                                .title("Content Service API")
                                .version("1.0")
                                .description("Content Management APIs")
                                .contact(
                                        new Contact()
                                                .name("Purushottam Dasari")
                                )
                )
                // API Gateway URL
                .servers(
                        List.of(
                                new Server()
                                        .url("http://localhost:8090")
                                        .description("API Gateway")
                        )
                )
                // JWT Security
                .addSecurityItem(
                        new SecurityRequirement()
                                .addList("bearerAuth")
                )
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        "bearerAuth",
                                        new SecurityScheme()
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                );
    }
}