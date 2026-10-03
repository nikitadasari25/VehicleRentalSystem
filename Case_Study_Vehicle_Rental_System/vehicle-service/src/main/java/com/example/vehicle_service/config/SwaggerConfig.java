package com.example.vehicle_service.config;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(
                        new Info()
                                .title("Vehicle Service API")
                                .version("1.0")
                                .description("Vehicle Management APIs")
                                .contact(
                                        new Contact()
                                                .name("Ramadevi Gajul")
                                )
                )
                .servers(
                        List.of(
                                new Server()
                                        .url("http://localhost:8090")
                                        .description("API Gateway")
                        )
                );
    }
}