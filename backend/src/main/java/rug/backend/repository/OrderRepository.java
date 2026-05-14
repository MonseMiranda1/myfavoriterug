package rug.backend.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import rug.backend.model.CustomerOrder;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);

    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
}
