package rug.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import rug.backend.model.AccountUser;
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

    @BeforeEach
    void cleanDatabase() {
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
        assertThat(accountUserRepository.existsByEmailIgnoreCase("MARIA@example.com")).isTrue();
        assertThat(accountSessionRepository.findByToken(result.token())).isPresent();
        assertThat(result.user().getPasswordHash()).startsWith("pbkdf2_sha256$");
        assertThat(result.user().getPasswordHash()).doesNotContain("secret123");
    }

    @Test
    void registerRejectsDuplicatedEmailIgnoringCase() {
        authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "", ""));

        assertThatThrownBy(() -> authService.register(new RegisterInput("Other", "MARIA@example.com", "secret123", "", "", "")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cuenta");
    }

    @Test
    void loginCreatesNewSessionWhenPasswordMatches() {
        authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "", ""));

        var result = authService.login(" MARIA@example.com ", "secret123");

        assertThat(result.token()).isNotBlank();
        assertThat(result.user().getEmail()).isEqualTo("maria@example.com");
        assertThat(accountSessionRepository.findByToken(result.token())).isPresent();
    }

    @Test
    void loginRejectsInvalidPassword() {
        authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "", ""));

        assertThatThrownBy(() -> authService.login("maria@example.com", "wrong-password"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("incorrectos");
    }

    @Test
    void updateProfilePersistsEditableFieldsWithoutChangingEmail() {
        var registered = authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "", ""));

        AccountUser updated = authService.updateProfile(registered.user(), new ProfileInput(
                "Maria Updated",
                "+56912345678",
                "22.222.222-2",
                "Providencia"));

        assertThat(updated.getEmail()).isEqualTo("maria@example.com");
        assertThat(updated.getName()).isEqualTo("Maria Updated");
        assertThat(updated.getPhone()).isEqualTo("+56912345678");
        assertThat(updated.getRut()).isEqualTo("22.222.222-2");
        assertThat(updated.getAddress()).isEqualTo("Providencia");

        assertThat(accountUserRepository.findByEmailIgnoreCase("maria@example.com"))
                .get()
                .extracting(AccountUser::getName)
                .isEqualTo("Maria Updated");
    }

    @Test
    void logoutRemovesOnlyTheGivenSession() {
        var registered = authService.register(new RegisterInput("Maria", "maria@example.com", "secret123", "", "", ""));
        var loggedIn = authService.login("maria@example.com", "secret123");

        authService.logout(registered.token());

        assertThat(authService.findUserByToken(registered.token())).isEmpty();
        assertThat(authService.findUserByToken(loggedIn.token())).isPresent();
    }
}
