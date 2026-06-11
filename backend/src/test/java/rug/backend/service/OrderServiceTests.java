package rug.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import rug.backend.model.AccountUser;
import rug.backend.model.CustomerOrder;
import rug.backend.model.OrderItem;
import rug.backend.repository.OrderRepository;
import rug.backend.repository.PaymentRepository;

@ExtendWith(MockitoExtension.class)
class OrderServiceTests {
    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void authenticatedOrderUsesAccountIdentity() {
        AccountUser user = new AccountUser();
        user.setName("Maria");
        user.setEmail("maria@example.com");

        CustomerOrder order = new CustomerOrder();
        order.setCustomerName("Otro nombre");
        order.setEmail("otro@example.com");
        order.setPaymentMethod("FLOW");

        when(orderRepository.save(order)).thenReturn(order);

        CustomerOrder saved = orderService.createOrder(order, user);

        assertThat(saved.getCustomerName()).isEqualTo("Maria");
        assertThat(saved.getEmail()).isEqualTo("maria@example.com");
        assertThat(saved.getAccountUser()).isSameAs(user);
    }

    @Test
    void coordinatedPickupDoesNotIncludeShippingInTotal() {
        OrderItem item = new OrderItem();
        item.setPrice(12000);
        item.setQuantity(2);

        CustomerOrder order = new CustomerOrder();
        order.setShippingMethod("Retiro coordinado");
        order.setPaymentMethod("FLOW");
        order.setItems(List.of(item));
        order.setTotal(28500);

        when(orderRepository.save(order)).thenReturn(order);

        CustomerOrder saved = orderService.createOrder(order, null);

        assertThat(saved.getTotal()).isEqualTo(24000);
    }

    @Test
    void accountOrdersIncludeAndAssociateHistoricalOrdersByAuthenticatedEmail() {
        AccountUser user = new AccountUser();
        user.setEmail("maria@example.com");
        CustomerOrder accountOrder = new CustomerOrder();
        CustomerOrder historicalOrder = new CustomerOrder();

        when(orderRepository.findAllByAccountUserOrderByCreatedAtDesc(user))
                .thenReturn(new java.util.ArrayList<>(List.of(accountOrder)));
        when(orderRepository.findAllByAccountUserIsNullAndEmailIgnoreCaseOrderByCreatedAtDesc(user.getEmail()))
                .thenReturn(List.of(historicalOrder));

        assertThat(orderService.getOrdersForUser(user)).containsExactly(accountOrder, historicalOrder);
        assertThat(historicalOrder.getAccountUser()).isSameAs(user);
        verify(orderRepository).findAllByAccountUserOrderByCreatedAtDesc(user);
        verify(orderRepository).findAllByAccountUserIsNullAndEmailIgnoreCaseOrderByCreatedAtDesc("maria@example.com");
        verify(orderRepository).saveAll(List.of(historicalOrder));
    }
}
