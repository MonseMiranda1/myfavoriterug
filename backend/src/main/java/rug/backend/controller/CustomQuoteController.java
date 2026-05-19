package rug.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import rug.backend.model.AccountUser;
import rug.backend.model.CustomQuote;
import rug.backend.service.AuthService;
import rug.backend.service.CustomQuoteService;

@RestController
@RequestMapping("/api/quotes")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class CustomQuoteController {
    private final CustomQuoteService customQuoteService;
    private final AuthService authService;

    public CustomQuoteController(CustomQuoteService customQuoteService, AuthService authService) {
        this.customQuoteService = customQuoteService;
        this.authService = authService;
    }

    @GetMapping
    public List<CustomQuote> getQuotes() {
        return customQuoteService.getQuotes();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyQuotes(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return authService.findUserByToken(extractBearerToken(authorization))
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(customQuoteService.getQuotesForUser(user)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Sesion invalida.")));
    }

    @PostMapping
    public ResponseEntity<?> createQuote(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody CustomQuote quote) {
        try {
            AccountUser user = authService.findUserByToken(extractBearerToken(authorization)).orElse(null);
            return ResponseEntity.ok(customQuoteService.createQuote(quote, user));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(new ErrorResponse(exception.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuote(@PathVariable Long id) {
        customQuoteService.deleteQuote(id);
        return ResponseEntity.noContent().build();
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }

        return authorization.substring("Bearer ".length());
    }

    public record ErrorResponse(String message) {
    }
}
