package rug.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import rug.backend.model.CustomerReview;
import rug.backend.service.CustomerReviewService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerReviewController {
    private final CustomerReviewService customerReviewService;

    public CustomerReviewController(CustomerReviewService customerReviewService) {
        this.customerReviewService = customerReviewService;
    }

    @GetMapping
    public List<CustomerReview> getReviews() {
        return customerReviewService.getReviews();
    }

    @GetMapping("/admin")
    public List<CustomerReview> getAdminReviews() {
        return customerReviewService.getAdminReviews();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createReview(
        @RequestParam("name") String name,
        @RequestParam("rating") Integer rating,
        @RequestParam("comment") String comment,
        @RequestParam(value = "productPhoto", required = false) MultipartFile productPhoto
    ) {
        try {
            return ResponseEntity.ok(customerReviewService.createReview(name, rating, comment, productPhoto));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(new ReviewErrorResponse(exception.getMessage()));
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ReviewErrorResponse(exception.getMessage()));
        }
    }

    @PutMapping("/{id}/approval")
    public ResponseEntity<?> setApproval(@PathVariable Long id, @RequestParam("approved") Boolean approved) {
        try {
            return ResponseEntity.ok(customerReviewService.setApproval(id, approved));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(new ReviewErrorResponse(exception.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            customerReviewService.deleteReview(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(new ReviewErrorResponse(exception.getMessage()));
        }
    }

    public record ReviewErrorResponse(String message) {
    }
}
