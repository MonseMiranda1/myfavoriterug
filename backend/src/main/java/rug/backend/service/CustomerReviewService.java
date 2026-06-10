package rug.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import rug.backend.model.CustomerReview;
import rug.backend.repository.CustomerReviewRepository;

@Service
public class CustomerReviewService {
    private final CustomerReviewRepository customerReviewRepository;
    private final ReviewImageStorageService reviewImageStorageService;

    public CustomerReviewService(CustomerReviewRepository customerReviewRepository, ReviewImageStorageService reviewImageStorageService) {
        this.customerReviewRepository = customerReviewRepository;
        this.reviewImageStorageService = reviewImageStorageService;
    }

    public List<CustomerReview> getReviews() {
        return customerReviewRepository.findAllByApprovedTrueOrderByCreatedAtDesc();
    }

    public List<CustomerReview> getAdminReviews() {
        return customerReviewRepository.findAllByOrderByCreatedAtDesc();
    }

    public CustomerReview createReview(String name, Integer rating, String comment, MultipartFile productPhoto) {
        String cleanName = name == null ? "" : name.trim();
        String cleanComment = comment == null ? "" : comment.trim();

        if (cleanName.isBlank()) {
            throw new IllegalArgumentException("Ingresa tu nombre.");
        }

        if (cleanComment.isBlank()) {
            throw new IllegalArgumentException("Ingresa tu comentario.");
        }

        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("La calificacion debe estar entre 1 y 5.");
        }

        String productImage = reviewImageStorageService.store(productPhoto);
        CustomerReview review = new CustomerReview(cleanName, rating, cleanComment, productImage, false);
        return customerReviewRepository.save(review);
    }

    public CustomerReview setApproval(Long id, Boolean approved) {
        CustomerReview review = customerReviewRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Reseña no encontrada."));

        review.setApproved(Boolean.TRUE.equals(approved));
        return customerReviewRepository.save(review);
    }

    public void deleteReview(Long id) {
        if (!customerReviewRepository.existsById(id)) {
            throw new IllegalArgumentException("Reseña no encontrada.");
        }

        customerReviewRepository.deleteById(id);
    }
}
