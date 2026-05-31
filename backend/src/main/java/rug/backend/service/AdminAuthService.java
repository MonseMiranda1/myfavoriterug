package rug.backend.service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {
    private static final Duration SESSION_TTL = Duration.ofHours(12);

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, Instant> activeTokens = new ConcurrentHashMap<>();
    private final String username;
    private final String password;

    public AdminAuthService(
        @Value("${app.admin.username}") String username,
        @Value("${app.admin.password}") String password
    ) {
        this.username = username;
        this.password = password;
    }

    public String login(String usernameInput, String passwordInput) {
        if (!constantTimeEquals(username, usernameInput == null ? "" : usernameInput.trim())
            || !constantTimeEquals(password, passwordInput == null ? "" : passwordInput)) {
            throw new IllegalArgumentException("Usuario o password incorrecto.");
        }

        String token = generateToken();
        activeTokens.put(token, Instant.now().plus(SESSION_TTL));
        return token;
    }

    public boolean isValidToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        Instant expiresAt = activeTokens.get(token);

        if (expiresAt == null) {
            return false;
        }

        if (expiresAt.isBefore(Instant.now())) {
            activeTokens.remove(token);
            return false;
        }

        return true;
    }

    public void logout(String token) {
        Optional.ofNullable(token).ifPresent(activeTokens::remove);
    }

    private String generateToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private boolean constantTimeEquals(String expected, String actual) {
        return MessageDigest.isEqual(expected.getBytes(), actual.getBytes());
    }
}
