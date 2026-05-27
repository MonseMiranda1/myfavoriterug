package rug.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ReviewImageStorageService {
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final Path uploadRoot;
    private final String backendBaseUrl;

    public ReviewImageStorageService(
        @Value("${app.review-upload-dir:uploads/review-images}") String uploadDir,
        @Value("${app.backend-base-url:http://localhost:8080}") String backendBaseUrl
    ) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.backendBaseUrl = backendBaseUrl.replaceAll("/+$", "");
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String contentType = file.getContentType();

        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Formato de imagen no permitido.");
        }

        try {
            Files.createDirectories(uploadRoot);

            String fileName = UUID.randomUUID() + extensionFor(contentType);
            Path destination = uploadRoot.resolve(fileName).normalize();

            if (!destination.startsWith(uploadRoot)) {
                throw new IllegalArgumentException("Ruta de imagen invalida.");
            }

            file.transferTo(destination);
            return backendBaseUrl + "/uploads/review-images/" + fileName;
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo guardar la imagen.", exception);
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
