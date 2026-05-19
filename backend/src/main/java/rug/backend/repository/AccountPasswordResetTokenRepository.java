package rug.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import rug.backend.model.AccountPasswordResetToken;
import rug.backend.model.AccountUser;

public interface AccountPasswordResetTokenRepository extends JpaRepository<AccountPasswordResetToken, Long> {
    Optional<AccountPasswordResetToken> findByTokenHashAndUsedAtIsNull(String tokenHash);

    void deleteByUserAndUsedAtIsNull(AccountUser user);
}
