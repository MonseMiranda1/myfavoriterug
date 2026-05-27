package rug.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import rug.backend.model.CustomerReview;

public interface CustomerReviewRepository extends JpaRepository<CustomerReview, Long> {
    List<CustomerReview> findAllByOrderByCreatedAtDesc();
}
