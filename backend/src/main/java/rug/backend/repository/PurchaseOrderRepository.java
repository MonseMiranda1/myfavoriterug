package rug.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import rug.backend.model.PurchaseOrder;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();
}
