package rug.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import rug.backend.model.AccountUser;

public interface AccountUserRepository extends JpaRepository<AccountUser, Long> {
    Optional<AccountUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
