package rug.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import rug.backend.model.AccountUser;
import rug.backend.service.AuthService;
import rug.backend.service.AuthService.ProfileInput;
import rug.backend.service.AuthService.RegisterInput;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(toAuthResponse(authService.register(new RegisterInput(
                    request.name(),
                    request.email(),
                    request.password(),
                    request.phone(),
                    request.rut(),
                    request.address()))));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(new ErrorResponse(exception.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(toAuthResponse(authService.login(request.email(), request.password())));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(exception.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return authService.findUserByToken(extractBearerToken(authorization))
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(toUserResponse(user)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Sesion invalida.")));
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody ProfileRequest request) {
        return authService.findUserByToken(extractBearerToken(authorization))
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(toUserResponse(authService.updateProfile(user, new ProfileInput(
                        request.name(),
                        request.phone(),
                        request.rut(),
                        request.address())))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Sesion invalida.")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        authService.logout(extractBearerToken(authorization));
        return ResponseEntity.noContent().build();
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }

        return authorization.substring("Bearer ".length());
    }

    private AuthResponse toAuthResponse(AuthService.AuthResult authResult) {
        return new AuthResponse(authResult.token(), toUserResponse(authResult.user()));
    }

    private UserResponse toUserResponse(AccountUser user) {
        return new UserResponse(user.getName(), user.getEmail(), user.getPhone(), user.getRut(), user.getAddress());
    }

    public record LoginRequest(String email, String password) {
    }

    public record RegisterRequest(String name, String email, String password, String phone, String rut, String address) {
    }

    public record ProfileRequest(String name, String phone, String rut, String address) {
    }

    public record UserResponse(String name, String email, String phone, String rut, String address) {
    }

    public record AuthResponse(String token, UserResponse user) {
    }

    public record ErrorResponse(String message) {
    }
}
