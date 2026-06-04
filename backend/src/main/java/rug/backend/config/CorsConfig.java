package rug.backend.config;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    @Value("${app.frontend-allowed-origin-patterns:}")
    private String frontendAllowedOriginPatterns;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOriginPatterns(allowedOriginPatterns())
                    .allowedMethods("*")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }

    private String[] allowedOriginPatterns() {
        Set<String> origins = new LinkedHashSet<>();
        addOrigins(origins, frontendBaseUrl);
        addOrigins(origins, frontendAllowedOriginPatterns);
        origins.add("http://localhost:5173");
        origins.add("http://127.0.0.1:5173");
        return origins.toArray(String[]::new);
    }

    private void addOrigins(Set<String> origins, String value) {
        if (value == null || value.isBlank()) {
            return;
        }

        Arrays.stream(value.split(","))
            .map(String::trim)
            .map(this::removeTrailingSlash)
            .filter(origin -> !origin.isBlank())
            .forEach(origins::add);
    }

    private String removeTrailingSlash(String origin) {
        while (origin.endsWith("/")) {
            origin = origin.substring(0, origin.length() - 1);
        }

        return origin;
    }
}
