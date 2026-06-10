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
    void accountOrdersAreFilteredByAuthenticatedEmail() {
        AccountUser user = new AccountUser();
        user.setEmail("maria@example.com");
        when(orderRepository.findAllByAccountUserOrderByCreatedAtDesc(user))
                .thenReturn(List.of(new CustomerOrder()));

        assertThat(orderService.getOrdersForUser(user)).hasSize(1);
        verify(orderRepository).findAllByAccountUserOrderByCreatedAtDesc(user);
    }
}
