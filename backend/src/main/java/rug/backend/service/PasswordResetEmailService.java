package rug.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import rug.backend.model.AccountUser;

@Service
public class PasswordResetEmailService {
    private static final Logger LOGGER = LoggerFactory.getLogger(PasswordResetEmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String frontendBaseUrl;

    public PasswordResetEmailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.mail.from:no-reply@myfavoriterug.local}") String fromAddress,
            @Value("${app.frontend-base-url:http://localhost:5173}") String frontendBaseUrl) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.fromAddress = fromAddress;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public void sendPasswordResetToken(AccountUser user, String token) {
        String resetUrl = frontendBaseUrl + "/cuenta?resetToken=" + token + "&email=" + user.getEmail();

        if (mailSender == null) {
            LOGGER.warn("Password reset token for {}: {} ({})", user.getEmail(), token, resetUrl);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("Recuperacion de contrasena - My Favorite Rug");
        message.setText("""
                Hola %s,

                Usa este token para restaurar tu contrasena:

                %s

                Tambien puedes abrir este enlace:
                %s

                El token expira en 30 minutos. Si no pediste este cambio, ignora este correo.
                """.formatted(user.getName(), token, resetUrl));

        mailSender.send(message);
    }
}
