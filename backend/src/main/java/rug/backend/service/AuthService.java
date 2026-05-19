package rug.backend.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;
import java.util.Optional;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rug.backend.model.AccountSession;
import rug.backend.model.AccountUser;
import rug.backend.repository.AccountSessionRepository;
import rug.backend.repository.AccountUserRepository;

@Service
public class AuthService {
    private static final int SALT_BYTES = 16;
    private static final int HASH_BYTES = 32;
    private static final int HASH_ITERATIONS = 120000;

    private final SecureRandom secureRandom = new SecureRandom();
    private final AccountUserRepository accountUserRepository;
    private final AccountSessionRepository accountSessionRepository;

    public AuthService(AccountUserRepository accountUserRepository, AccountSessionRepository accountSessionRepository) {
        this.accountUserRepository = accountUserRepository;
        this.accountSessionRepository = accountSessionRepository;
    }

    public AuthResult register(RegisterInput input) {
        String email = normalizeEmail(input.email());
        String password = requireText(input.password(), "La contraseña es obligatoria.");

        if (password.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres.");
        }

        if (accountUserRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo.");
        }

        AccountUser user = new AccountUser();
        user.setName(defaultText(input.name(), email.substring(0, email.indexOf("@"))));
        user.setEmail(email);
        user.setPhone(defaultText(input.phone(), ""));
        user.setRut(defaultText(input.rut(), ""));
        user.setAddress(defaultText(input.address(), ""));
        user.setPasswordHash(hashPassword(password));

        return createSession(accountUserRepository.save(user));
    }

    public AuthResult login(String emailInput, String passwordInput) {
        String email = normalizeEmail(emailInput);
        String password = requireText(passwordInput, "La contraseña es obligatoria.");
        AccountUser user = accountUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Correo o contraseña incorrectos."));

        if (!verifyPassword(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Correo o contraseña incorrectos.");
        }

        return createSession(user);
    }

    public Optional<AccountUser> findUserByToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        return accountSessionRepository.findByToken(token).map(AccountSession::getUser);
    }

    public AccountUser updateProfile(AccountUser user, ProfileInput input) {
        user.setName(defaultText(input.name(), user.getName()));
        user.setPhone(defaultText(input.phone(), ""));
        user.setRut(defaultText(input.rut(), ""));
        user.setAddress(defaultText(input.address(), ""));

        return accountUserRepository.save(user);
    }

    @Transactional
    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            accountSessionRepository.deleteByToken(token);
        }
    }

    private AuthResult createSession(AccountUser user) {
        AccountSession session = new AccountSession();
        session.setToken(generateToken());
        session.setUser(user);
        accountSessionRepository.save(session);

        return new AuthResult(session.getToken(), user);
    }

    private String generateToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashPassword(String password) {
        byte[] salt = new byte[SALT_BYTES];
        secureRandom.nextBytes(salt);
        byte[] hash = pbkdf2(password, salt);

        return "pbkdf2_sha256$" + HASH_ITERATIONS + "$"
                + Base64.getEncoder().encodeToString(salt) + "$"
                + Base64.getEncoder().encodeToString(hash);
    }

    private boolean verifyPassword(String password, String storedHash) {
        String[] parts = storedHash.split("\\$");

        if (parts.length != 4 || !"pbkdf2_sha256".equals(parts[0])) {
            return false;
        }

        byte[] salt = Base64.getDecoder().decode(parts[2]);
        byte[] expectedHash = Base64.getDecoder().decode(parts[3]);
        byte[] actualHash = pbkdf2(password, salt);

        return MessageDigest.isEqual(expectedHash, actualHash);
    }

    private byte[] pbkdf2(String password, byte[] salt) {
        try {
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, HASH_ITERATIONS, HASH_BYTES * 8);
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException exception) {
            throw new IllegalStateException("No se pudo procesar la contraseña.", exception);
        }
    }

    private String normalizeEmail(String email) {
        String normalizedEmail = requireText(email, "El correo es obligatorio.").trim().toLowerCase();

        if (!normalizedEmail.contains("@")) {
            throw new IllegalArgumentException("Ingresa un correo valido.");
        }

        return normalizedEmail;
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return value;
    }

    private String defaultText(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }

        return value.trim();
    }

    public record RegisterInput(String name, String email, String password, String phone, String rut, String address) {
    }

    public record ProfileInput(String name, String phone, String rut, String address) {
    }

    public record AuthResult(String token, AccountUser user) {
    }
}
