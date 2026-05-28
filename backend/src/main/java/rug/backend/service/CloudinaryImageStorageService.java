package rug.backend.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CloudinaryImageStorageService {
    private static final Pattern SECURE_URL_PATTERN = Pattern.compile("\\\"secure_url\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"");

    private final HttpClient httpClient;
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryImageStorageService(
        @Value("${cloudinary.cloud-name:}") String cloudName,
        @Value("${cloudinary.api-key:}") String apiKey,
        @Value("${cloudinary.api-secret:}") String apiSecret
    ) {
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public boolean isConfigured() {
        return hasText(cloudName) && hasText(apiKey) && hasText(apiSecret);
    }

    public String upload(MultipartFile file, String folder) {
        if (!isConfigured()) {
            throw new IllegalStateException("Cloudinary no esta configurado.");
        }

        try {
            String boundary = "----MyFavoriteRug" + UUID.randomUUID();
            long timestamp = Instant.now().getEpochSecond();
            Map<String, String> signedParameters = new TreeMap<>();
            signedParameters.put("folder", folder);
            signedParameters.put("timestamp", String.valueOf(timestamp));

            ByteArrayOutputStream body = new ByteArrayOutputStream();
            writeField(body, boundary, "api_key", apiKey);
            writeField(body, boundary, "folder", folder);
            writeField(body, boundary, "timestamp", String.valueOf(timestamp));
            writeField(body, boundary, "signature", sign(signedParameters));
            writeFile(body, boundary, file);
            body.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload"))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray()))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Cloudinary rechazo la imagen: " + response.body());
            }

            String secureUrl = readSecureUrl(response.body());

            if (!hasText(secureUrl)) {
                throw new IllegalStateException("Cloudinary no devolvio una URL segura.");
            }

            return secureUrl;
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo subir la imagen a Cloudinary.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Se interrumpio la subida a Cloudinary.", exception);
        }
    }

    private String sign(Map<String, String> parameters) {
        StringBuilder payload = new StringBuilder();

        parameters.forEach((key, value) -> {
            if (!value.isBlank()) {
                if (!payload.isEmpty()) {
                    payload.append('&');
                }
                payload.append(key).append('=').append(value);
            }
        });

        payload.append(apiSecret);

        try {
            byte[] digest = MessageDigest.getInstance("SHA-1").digest(payload.toString().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("No se pudo firmar la subida a Cloudinary.", exception);
        }
    }

    private void writeField(ByteArrayOutputStream body, String boundary, String name, String value) throws IOException {
        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(value.getBytes(StandardCharsets.UTF_8));
        body.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private void writeFile(ByteArrayOutputStream body, String boundary, MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename() == null || file.getOriginalFilename().isBlank()
            ? "image"
            : file.getOriginalFilename();

        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + filename.replace("\"", "") + "\"\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Type: " + file.getContentType() + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(file.getBytes());
        body.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private String readSecureUrl(String responseBody) {
        Matcher matcher = SECURE_URL_PATTERN.matcher(responseBody);
        return matcher.find() ? matcher.group(1).replace("\\/", "/") : "";
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
