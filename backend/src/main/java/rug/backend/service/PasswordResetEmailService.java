package rug.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import rug.backend.model.AccountUser;
import java.util.Map;
import java.util.HashMap;

@Service
public class PasswordResetEmailService {
    private static final Logger LOGGER = LoggerFactory.getLogger(PasswordResetEmailService.class);

    private final String frontendBaseUrl;

    public PasswordResetEmailService(
            @Value("${app.frontend-base-url:http://localhost:5173}") String frontendBaseUrl) {
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public void sendPasswordResetToken(AccountUser user, String token) {
        String resetUrl = frontendBaseUrl + "/cuenta?resetToken=" + token + "&email=" + user.getEmail();
        
        // 1. Traer la API Key de las variables de entorno de Render
        String apiKey = System.getenv("RESEND_API_KEY");
        
        // Si estás en local y no configuraste Resend, te lo muestra en la terminal para desarrollo rápido
        if (apiKey == null || apiKey.isBlank()) {
            LOGGER.warn("[MODO DESARROLLO] Token para {}: {} ({})", user.getEmail(), token, resetUrl);
            return;
        }

        // 2. Configurar la petición HTTP
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        // 3. Redactar el mensaje en formato HTML
        String emailContent = """
                <p>Hola %s,</p>
                <p>Usa este token para restaurar tu contraseña:</p>
                <h2 style='color: #4F46E5;'>%s</h2>
                <p>También puedes ingresar directamente haciendo clic en el siguiente enlace:</p>
                <p><a href='%s'>Restablecer mi contraseña</a></p>
                <p>El token expira en 30 minutos. Si no pediste este cambio, puedes ignorar este correo de forma segura.</p>
                """.formatted(user.getName(), token, resetUrl);

        // 4. Armar el JSON requerido por la API de Resend
        Map<String, Object> body = new HashMap<>();
        body.put("from", "onboarding@resend.dev"); // Remitente gratuito obligatorio de Resend
        body.put("to", user.getEmail());
        body.put("subject", "Recuperacion de contrasena - My Favorite Rug");
        body.put("html", emailContent);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        // 5. Enviar usando la URL correcta de la API de Resend
        try {
            // ✅ CORREGIDO: URL correcta de la API de Resend
            String resendApiUrl = "https://api.resend.com/emails";
            
            var response = restTemplate.postForEntity(resendApiUrl, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                LOGGER.info("Correo de recuperación enviado exitosamente a: {}", user.getEmail());
            } else {
                LOGGER.error("Resend respondió con error: {} - {}", response.getStatusCode(), response.getBody());
                throw new IllegalArgumentException("Error al enviar el correo: " + response.getStatusCode());
            }
        } catch (Exception e) {
            LOGGER.error("Error crítico al conectar con la API de Resend: {}", e.getMessage());
            throw new IllegalArgumentException("No se pudo enviar el token de recuperacion: " + e.getMessage());
        }
    }
}