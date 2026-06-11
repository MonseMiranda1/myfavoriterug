package rug.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import rug.backend.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findAllByOrderByCreatedAtDesc();
    List<Payment> findByOrderId(Long orderId);
    Optional<Payment> findFirstByOrderIdOrderByCreatedAtDesc(Long orderId);
    Optional<Payment> findByToken(String token);
    void deleteByOrderId(Long orderId);
}
