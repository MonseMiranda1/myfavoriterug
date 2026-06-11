package rug.backend.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import rug.backend.model.Payment;
import rug.backend.service.PaymentService;
import rug.backend.service.PaymentService.OrderConfirmation;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<Payment> getPayments() {
        return paymentService.getPayments();
    }

    @GetMapping("/order/{orderId}")
    public List<Payment> getPaymentsForOrder(@PathVariable Long orderId) {
        return paymentService.getPaymentsForOrder(orderId);
    }

    @GetMapping("/order/{orderId}/confirmation")
    public ResponseEntity<OrderConfirmation> getOrderConfirmation(@PathVariable Long orderId) {
        OrderConfirmation confirmation = paymentService.getOrderConfirmation(orderId);

        if (confirmation == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(confirmation);
    }

    @PostMapping("/intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody CreatePaymentIntentRequest request) {
        Payment payment;

        try {
            String publicBackendUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .build()
                    .toUriString();
            payment = paymentService.createPaymentIntent(request.orderId(), request.provider(), publicBackendUrl);
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

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long paymentId) {
        paymentService.deletePayment(paymentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/flow/confirmation")
    public ResponseEntity<String> confirmFlowPayment(@RequestParam String token) {
        Payment payment = paymentService.confirmFlowPayment(token);

        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok("OK");
    }

    @RequestMapping(value = "/flow/return", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<Void> returnFromFlow(
            @RequestParam Long orderId,
            @RequestParam(required = false) String token) {
        if (token != null && !token.isBlank()) {
            paymentService.confirmFlowPayment(token);
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(paymentService.getOrderConfirmationUrl(orderId)))
                .build();
    }

    public record CreatePaymentIntentRequest(Long orderId, String provider) {
    }

    public record PaymentErrorResponse(String message) {
    }
}
