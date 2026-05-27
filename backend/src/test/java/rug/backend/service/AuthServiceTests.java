package rug.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import rug.backend.model.AccountPasswordResetToken;
import rug.backend.model.AccountUser;
import rug.backend.repository.AccountPasswordResetTokenRepository;
import rug.backend.repository.AccountSessionRepository;
import rug.backend.repository.AccountUserRepository;
import rug.backend.service.AuthService.ProfileInput;
import rug.backend.service.AuthService.RegisterInput;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:auth-service-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class AuthServiceTests {
    @Autowired
    private AuthService authService;

    @Autowired
    private AccountUserRepository accountUserRepository;

    @Autowired
    private AccountSessionRepository accountSessionRepository;

    @Autowired
    private AccountPasswordResetTokenRepository accountPasswordResetTokenRepository;

    @MockitoBean
    private PasswordResetEmailService passwordResetEmailService;

    @BeforeEach
    void cleanDatabase() {
        accountPasswordResetTokenRepository.deleteAll();
        accountSessionRepository.deleteAll();
        accountUserRepository.deleteAll();
    }

    @Test
    void registerCreatesUserWithNormalizedEmailAndSession() {
        var result = authService.register(new RegisterInput(
                " Maria Lopez ",
                " MARIA@EXAMPLE.COM ",
                "secret123",
                " 999 ",
                " 11.111.111-1 ",
                " Santiago "));

        assertThat(result.token()).isNotBlank();
        assertThat(result.user().getEmail()).isEqualTo("maria@example.com");
        assertThat(result.user().getName()).isEqualTo("Maria Lopez");
        assertThat(result.user().getPhone()).isEqualTo("999");
        assertThat(result.user().getRut()).isEqualTo("11.111.111-1");
        assertThat(result.user().getRutCanonical()).isEqualTo("111111111");
        assertThat(accountUserRepository.existsByEmailIgnoreCase("MARIA@example.com")).isTrue();
        assertThat(accountSessionRepository.findByToken(result.token())).isPresent();
        assertThat(result.user().getPasswordHash()).startsWith("pbkdf2_sha256$");
        assertThat(result.user().getPasswordHash()).doesNotContain("secret123");
    }

    @Test
    void registerRejectsMissingRut() {
        assertThatThrownBy(() -> authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "", "")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("RUT");
    }

    @Test
    void registerRejectsDuplicatedEmailIgnoringCase() {
        authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "11.111.111-1", ""));

        assertThatThrownBy(() -> authService.register(new RegisterInput("Other", "MARIA@example.com", "secret123", "", "22.222.222-2", "")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("correo");
    }

    @Test
    void registerRejectsDuplicatedRutIgnoringFormat() {
        authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "11.111.111-1", ""));

        assertThatThrownBy(() -> authService.register(new RegisterInput("Other", "other@example.com", "secret123", "", "111111111", "")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("RUT");
    }

    @Test
    void loginCreatesNewSessionWhenPasswordMatches() {
        authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "11.111.111-1", ""));

        var result = authService.login(" MARIA@example.com ", "secret123");

        assertThat(result.token()).isNotBlank();
        assertThat(result.user().getEmail()).isEqualTo("maria@example.com");
        assertThat(accountSessionRepository.findByToken(result.token())).isPresent();
    }

    @Test
    void loginRejectsInvalidPassword() {
        authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "11.111.111-1", ""));

        assertThatThrownBy(() -> authService.login("maria@example.com", "wrong-password"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("incorrectos");
    }

    @Test
    void updateProfilePersistsEditableFieldsWithoutChangingEmailOrRut() {
        var registered = authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "11.111.111-1", ""));

        AccountUser updated = authService.updateProfile(registered.user(), new ProfileInput(
                "Maria Updated",
                null,
                "+56912345678",
                null,
                "Providencia"));

        assertThat(updated.getEmail()).isEqualTo("maria@example.com");
        assertThat(updated.getName()).isEqualTo("Maria Updated");
        assertThat(updated.getPhone()).isEqualTo("+56912345678");
        assertThat(updated.getRut()).isEqualTo("11.111.111-1");
        assertThat(updated.getAddress()).isEqualTo("Providencia");

        assertThat(accountUserRepository.findByEmailIgnoreCase("maria@example.com"))
                .get()
                .extracting(AccountUser::getName)
                .isEqualTo("Maria Updated");
    }

    @Test
    void updateProfileRejectsEmailChanges() {
        var registered = authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "11.111.111-1", ""));

        assertThatThrownBy(() -> authService.updateProfile(registered.user(), new ProfileInput(
                "Maria",
                "other@example.com",
                "",
                null,
                "")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("correo");
    }

    @Test
    void updateProfileRejectsRutChanges() {
        var registered = authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "11.111.111-1", ""));

        assertThatThrownBy(() -> authService.updateProfile(registered.user(), new ProfileInput(
                "Maria",
                null,
                "",
                "22.222.222-2",
                "")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("RUT");
    }

    @Test
    void logoutRemovesOnlyTheGivenSession() {
        var registered = authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "11.111.111-1", ""));
        var loggedIn = authService.login("maria@example.com", "secret123");

        authService.logout(registered.token());

        assertThat(authService.findUserByToken(registered.token())).isEmpty();
        assertThat(authService.findUserByToken(loggedIn.token())).isPresent();
    }

    @Test
    void requestPasswordResetStoresTokenWithoutRevealingIfEmailExists() {
        authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "11.111.111-1", ""));

        authService.requestPasswordReset(" MARIA@example.com ");
        authService.requestPasswordReset("missing@example.com");

        assertThat(accountPasswordResetTokenRepository.findAll()).hasSize(1);
        assertThat(accountPasswordResetTokenRepository.findAll().getFirst().getExpiresAt()).isAfter(Instant.now());
    }

    @Test
    void resetPasswordChangesPasswordInvalidatesTokenAndSessions() throws Exception {
        var registered = authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "11.111.111-1", ""));
        String resetToken = "reset-token-123";

        AccountPasswordResetToken token = new AccountPasswordResetToken();
        token.setUser(registered.user());
        token.setTokenHash(hashToken(resetToken));
        token.setExpiresAt(Instant.now().plusSeconds(600));
        accountPasswordResetTokenRepository.save(token);

        authService.resetPassword("maria@example.com", resetToken, "updated123");

        assertThat(authService.findUserByToken(registered.token())).isEmpty();
        assertThat(authService.login("maria@example.com", "updated123").token()).isNotBlank();
        assertThatThrownBy(() -> authService.resetPassword("maria@example.com", resetToken, "again123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Token");
    }

    @Test
    void resetPasswordRejectsExpiredToken() throws Exception {
        var registered = authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "11.111.111-1", ""));
        String resetToken = "expired-token";

        AccountPasswordResetToken token = new AccountPasswordResetToken();
        token.setUser(registered.user());
        token.setTokenHash(hashToken(resetToken));
        token.setExpiresAt(Instant.now().minusSeconds(1));
        accountPasswordResetTokenRepository.save(token);

        assertThatThrownBy(() -> authService.resetPassword("maria@example.com", resetToken, "updated123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Token");
    }

    private String hashToken(String token) throws Exception {
        return Base64.getEncoder().encodeToString(MessageDigest.getInstance("SHA-256").digest(token.getBytes()));
    }
}
