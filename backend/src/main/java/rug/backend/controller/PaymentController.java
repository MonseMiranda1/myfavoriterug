package rug.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import rug.backend.model.Payment;
import rug.backend.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/order/{orderId}")
    public List<Payment> getPaymentsForOrder(@PathVariable Long orderId) {
        return paymentService.getPaymentsForOrder(orderId);
    }

    @PostMapping("/intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody CreatePaymentIntentRequest request) {
        Payment payment;

        try {
            payment = paymentService.createPaymentIntent(request.orderId(), request.provider());
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new PaymentErrorResponse(exception.getMessage()));
        }

        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(payment);
    }

    @PatchMapping("/{paymentId}/confirm")
    public ResponseEntity<Payment> confirmPayment(@PathVariable Long paymentId) {
        Payment payment = paymentService.confirmPayment(paymentId);

        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(payment);
    }

    @PatchMapping("/{paymentId}/fail")
    public ResponseEntity<Payment> failPayment(@PathVariable Long paymentId) {
        Payment payment = paymentService.failPayment(paymentId);

        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(payment);
    }

    @PostMapping("/flow/confirmation")
    public ResponseEntity<String> confirmFlowPayment(@RequestParam String token) {
        Payment payment = paymentService.confirmFlowPayment(token);

        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok("OK");
    }

    public record CreatePaymentIntentRequest(Long orderId, String provider) {
    }

    public record PaymentErrorResponse(String message) {
    }
}
