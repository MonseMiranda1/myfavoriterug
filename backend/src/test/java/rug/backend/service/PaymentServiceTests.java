package rug.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import rug.backend.model.CustomerOrder;
import rug.backend.model.OrderStatus;
import rug.backend.model.Payment;
import rug.backend.model.PaymentStatus;
import rug.backend.repository.PaymentRepository;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTests {
    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderService orderService;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                paymentRepository,
                orderService,
                "http://localhost:5173",
                "http://localhost:8080",
                "https://sandbox.flow.cl/api",
                "",
                "");
    }

    @Test
    void confirmingPaymentMarksPaymentPaidAndOrderConfirmed() {
        CustomerOrder order = new CustomerOrder();
        Payment payment = new Payment();
        payment.setOrder(order);
        order.setStatus(OrderStatus.PENDING_PAYMENT);

        when(paymentRepository.findById(10L)).thenReturn(java.util.Optional.of(payment));
        when(paymentRepository.save(payment)).thenReturn(payment);

        Payment confirmedPayment = paymentService.confirmPayment(10L);

        assertThat(confirmedPayment.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(confirmedPayment.getPaidAt()).isNotNull();
        verify(orderService).updateStatus(order.getId(), OrderStatus.CONFIRMED);
    }
}
