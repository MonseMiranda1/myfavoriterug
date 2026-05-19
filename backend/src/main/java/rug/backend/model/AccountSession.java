package rug.backend.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "account_sessions")
public class AccountSession {
    @Id
    @Column(length = 120)
    private String token;

    @ManyToOne(optional = false)
    @JoinColumn(name = "account_user_id", nullable = false)
    private AccountUser user;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public AccountUser getUser() {
        return user;
    }

    public void setUser(AccountUser user) {
        this.user = user;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
