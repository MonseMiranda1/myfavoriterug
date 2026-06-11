package rug.backend.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rug.backend.model.CustomerOrder;
import rug.backend.model.OrderStatus;
import rug.backend.model.AccountUser;
import rug.backend.repository.OrderRepository;
import rug.backend.repository.PaymentRepository;

@Service
public class OrderService {
    private static final int MAX_ITEM_IMAGE_LENGTH = 1200;

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public OrderService(OrderRepository orderRepository, PaymentRepository paymentRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    public List<CustomerOrder> getOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public CustomerOrder getOrder(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Transactional
    public List<CustomerOrder> getOrdersForUser(AccountUser user) {
        List<CustomerOrder> accountOrders = new ArrayList<>(
                orderRepository.findAllByAccountUserOrderByCreatedAtDesc(user));
        List<CustomerOrder> historicalOrders = orderRepository
                .findAllByAccountUserIsNullAndEmailIgnoreCaseOrderByCreatedAtDesc(user.getEmail());

        historicalOrders.forEach(order -> order.setAccountUser(user));

        if (!historicalOrders.isEmpty()) {
            orderRepository.saveAll(historicalOrders);
            accountOrders.addAll(historicalOrders);
            accountOrders.sort(Comparator.comparing(
                    CustomerOrder::getCreatedAt,
                    Comparator.nullsLast(Comparator.reverseOrder())));
        }

        return accountOrders;
    }

    public CustomerOrder createOrder(CustomerOrder order, AccountUser user) {
        if (user != null) {
            order.setCustomerName(user.getName());
            order.setEmail(user.getEmail());
            order.setAccountUser(user);
        }

        if (isCoordinatedPickup(order.getShippingMethod()) && order.getItems() != null) {
            int subtotal = order.getItems().stream()
                    .filter(item -> item.getPrice() != null && item.getQuantity() != null)
                    .mapToInt(item -> item.getPrice() * item.getQuantity())
                    .sum();
            order.setTotal(subtotal);
        }

        if ("Transferencia".equalsIgnoreCase(order.getPaymentMethod()) || "TRANSFERENCIA".equalsIgnoreCase(order.getPaymentMethod())) {
            order.setStatus(OrderStatus.CONFIRMED);
        }

        if (order.getItems() != null) {
            order.getItems().forEach(item -> {
                String image = item.getImage();

                if (image != null && image.length() > MAX_ITEM_IMAGE_LENGTH) {
                    item.setImage(image.substring(0, MAX_ITEM_IMAGE_LENGTH));
                }
            });
        }

        return orderRepository.save(order);
    }

    private boolean isCoordinatedPickup(String shippingMethod) {
        return "Retiro coordinado".equalsIgnoreCase(shippingMethod)
                || "Coordinated pickup".equalsIgnoreCase(shippingMethod);
    }

    public CustomerOrder updateShipping(Long id, String trackingNumber, String shippingStatus) {
        CustomerOrder order = getOrder(id);

        if (order == null) {
            return null;
        }

        order.setTrackingNumber(trackingNumber);
        order.setShippingStatus(shippingStatus);

        if (shippingStatus != null && !shippingStatus.isBlank()) {
            order.setStatus(OrderStatus.SHIPPED);
        }

        return orderRepository.save(order);
    }

    public CustomerOrder updateStatus(Long id, OrderStatus status) {
        CustomerOrder order = getOrder(id);

        if (order == null) {
            return null;
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public boolean deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            return false;
        }

        paymentRepository.deleteByOrderId(id);
        orderRepository.deleteById(id);
        return true;
    }
}
