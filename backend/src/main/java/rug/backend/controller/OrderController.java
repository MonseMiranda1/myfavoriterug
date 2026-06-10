package rug.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import rug.backend.model.AccountUser;
import rug.backend.model.CustomerOrder;
import rug.backend.model.OrderStatus;
import rug.backend.service.AuthService;
import rug.backend.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final AuthService authService;

    public OrderController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService = authService;
    }

    @GetMapping
    public List<CustomerOrder> getOrders() {
        return orderService.getOrders();
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyOrders(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return authenticatedUser(authorization)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(orderService.getOrdersForUser(user)))
                .orElseGet(() -> ResponseEntity.status(401).body(new ErrorResponse("Sesion invalida.")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerOrder> getOrder(@PathVariable Long id) {
        CustomerOrder order = orderService.getOrder(id);

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(order);
    }

    @PostMapping
    public ResponseEntity<CustomerOrder> createOrder(
            @RequestBody CustomerOrder order,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        Optional<AccountUser> authenticatedUser = authenticatedUser(authorization);

        if (authorization != null && authorization.startsWith("Bearer ") && authenticatedUser.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        AccountUser user = authenticatedUser.orElse(null);
        return ResponseEntity.ok(orderService.createOrder(order, user));
    }

    @PatchMapping("/{id}/shipping")
    public ResponseEntity<CustomerOrder> updateShipping(@PathVariable Long id, @RequestBody ShippingUpdateRequest request) {
        CustomerOrder order = orderService.updateShipping(id, request.trackingNumber(), request.shippingStatus());

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CustomerOrder> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        CustomerOrder order = orderService.updateStatus(id, request.status());

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(order);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        boolean deleted = orderService.deleteOrder(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    public record ShippingUpdateRequest(String trackingNumber, String shippingStatus) {
    }

    public record StatusUpdateRequest(OrderStatus status) {
    }

    public record ErrorResponse(String message) {
    }

    private Optional<AccountUser> authenticatedUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Optional.empty();
        }

        return authService.findUserByToken(authorization.substring("Bearer ".length()));
    }
}
