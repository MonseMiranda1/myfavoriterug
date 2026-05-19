package rug.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import rug.backend.model.AccountSession;
import rug.backend.model.AccountUser;

public interface AccountSessionRepository extends JpaRepository<AccountSession, String> {
    Optional<AccountSession> findByToken(String token);

    void deleteByToken(String token);

    void deleteByUser(AccountUser user);
}
