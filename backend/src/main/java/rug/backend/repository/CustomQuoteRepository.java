package rug.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import rug.backend.model.AccountUser;
import rug.backend.model.CustomQuote;

public interface CustomQuoteRepository extends JpaRepository<CustomQuote, Long> {
    List<CustomQuote> findAllByOrderByCreatedAtDesc();

    List<CustomQuote> findByUserOrderByCreatedAtDesc(AccountUser user);
}
