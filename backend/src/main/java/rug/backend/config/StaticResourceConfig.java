package rug.backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    private final Path productUploadRoot;
    private final Path reviewUploadRoot;

    public StaticResourceConfig(
        @Value("${app.upload-dir:uploads/product-images}") String uploadDir,
        @Value("${app.review-upload-dir:uploads/review-images}") String reviewUploadDir
    ) {
        this.productUploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.reviewUploadRoot = Paths.get(reviewUploadDir).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
            .addResourceHandler("/uploads/product-images/**")
            .addResourceLocations(productUploadRoot.toUri().toString() + "/");

        registry
            .addResourceHandler("/uploads/review-images/**")
            .addResourceLocations(reviewUploadRoot.toUri().toString() + "/");
    }
}
