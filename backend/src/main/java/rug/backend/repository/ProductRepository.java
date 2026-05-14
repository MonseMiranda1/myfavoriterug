package rug.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import rug.backend.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
