package rug.backend.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import rug.backend.model.CustomerOrder;
import rug.backend.model.OrderStatus;
import rug.backend.model.Payment;
import rug.backend.model.PaymentStatus;
import rug.backend.repository.PaymentRepository;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final String frontendBaseUrl;
    private final String backendBaseUrl;
    private final String flowApiUrl;
    private final String flowApiKey;
    private final String flowSecretKey;

    public PaymentService(
        PaymentRepository paymentRepository,
        OrderService orderService,
        @Value("${app.frontend-base-url}") String frontendBaseUrl,
        @Value("${app.backend-base-url}") String backendBaseUrl,
        @Value("${app.flow.api-url}") String flowApiUrl,
        @Value("${app.flow.api-key}") String flowApiKey,
        @Value("${app.flow.secret-key}") String flowSecretKey
    ) {
        this.paymentRepository = paymentRepository;
        this.orderService = orderService;
        this.frontendBaseUrl = frontendBaseUrl;
        this.backendBaseUrl = backendBaseUrl;
        this.flowApiUrl = flowApiUrl;
        this.flowApiKey = flowApiKey;
        this.flowSecretKey = flowSecretKey;
    }

    public List<Payment> getPaymentsForOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public List<Payment> getPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc();
    }

    public Payment createPaymentIntent(Long orderId, String provider) {
        CustomerOrder order = orderService.getOrder(orderId);

        if (order == null) {
            return null;
        }

        String normalizedProvider = provider == null || provider.isBlank() ? "manual" : provider.trim().toUpperCase();

        if ("FLOW".equals(normalizedProvider)) {
            return createFlowPayment(order);
        }

        if ("PAYPAL".equals(normalizedProvider)) {
            throw new IllegalStateException("PayPal todavia no esta conectado. Falta implementar PayPal Orders API.");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setProvider(normalizedProvider);
        payment.setAmount(order.getTotal());
        payment.setCurrency("CLP");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProviderPaymentId(UUID.randomUUID().toString());
        payment.setRedirectUrl(frontendBaseUrl + "/orden-confirmada?orderId=" + orderId);

        return paymentRepository.save(payment);
    }

    public Payment confirmPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId).orElse(null);

        if (payment == null) {
            return null;
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());
        orderService.updateStatus(payment.getOrder().getId(), OrderStatus.CONFIRMED);

        return paymentRepository.save(payment);
    }

    public Payment confirmFlowPayment(String token) {
        Payment payment = paymentRepository.findByToken(token).orElse(null);

        if (payment == null) {
            return null;
        }

        try {
            String responseBody = getFlowPaymentStatus(token);
            int flowStatus = extractJsonInt(responseBody, "status");

            payment.setRawResponse(responseBody);
            payment.setProviderOrderId(extractOptionalJsonValue(responseBody, "flowOrder"));

            if (flowStatus == 2) {
                payment.setStatus(PaymentStatus.PAID);
                payment.setPaidAt(Instant.now());
                orderService.updateStatus(payment.getOrder().getId(), OrderStatus.CONFIRMED);
            } else if (flowStatus == 3 || flowStatus == 4) {
                payment.setStatus(PaymentStatus.FAILED);
            } else {
                payment.setStatus(PaymentStatus.PENDING);
            }

            return paymentRepository.save(payment);
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo consultar el estado del pago en Flow.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("La consulta del estado del pago en Flow fue interrumpida.", exception);
        }
    }

    public Payment failPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId).orElse(null);

        if (payment == null) {
            return null;
        }

        payment.setStatus(PaymentStatus.FAILED);
        return paymentRepository.save(payment);
    }

    public void deletePayment(Long paymentId) {
        paymentRepository.deleteById(paymentId);
    }

    private Payment createFlowPayment(CustomerOrder order) {
        if (flowApiKey == null || flowApiKey.isBlank() || flowSecretKey == null || flowSecretKey.isBlank()) {
            throw new IllegalStateException("FLOW_API_KEY y FLOW_SECRET_KEY son obligatorios para crear pagos con Flow.");
        }

        try {
            Map<String, String> params = new LinkedHashMap<>();
            params.put("apiKey", flowApiKey);
            params.put("commerceOrder", order.getOrderNumber());
            params.put("subject", "Pedido " + order.getOrderNumber() + " - My Favorite Rug");
            params.put("currency", "CLP");
            params.put("amount", String.valueOf(order.getTotal()));
            params.put("email", order.getEmail());
            params.put("urlConfirmation", backendBaseUrl + "/api/payments/flow/confirmation");
            params.put("urlReturn", frontendBaseUrl + "/orden-confirmada?orderId=" + order.getId());
            params.put("s", sign(params));

            String responseBody = postForm(flowApiUrl + "/payment/create", params);
            String token = extractJsonValue(responseBody, "token");
            String paymentUrl = extractJsonValue(responseBody, "url");

            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setProvider("FLOW");
            payment.setAmount(order.getTotal());
            payment.setCurrency("CLP");
            payment.setStatus(PaymentStatus.PENDING);
            payment.setToken(token);
            payment.setProviderPaymentId(token);
            payment.setRedirectUrl(paymentUrl + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8));
            payment.setRawResponse(responseBody);

            return paymentRepository.save(payment);
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo crear el pago en Flow.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("La creacion del pago en Flow fue interrumpida.", exception);
        }
    }

    private String sign(Map<String, String> params) {
        try {
            Map<String, String> sortedParams = new TreeMap<>(params);
            StringBuilder toSign = new StringBuilder();

            sortedParams.forEach((key, value) -> toSign.append(key).append(value));

            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(flowSecretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(toSign.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder signature = new StringBuilder();

            for (byte currentByte : digest) {
                signature.append(String.format("%02x", currentByte));
            }

            return signature.toString();
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo firmar la solicitud de Flow.", exception);
        }
    }

    private String postForm(String url, Map<String, String> params) throws IOException, InterruptedException {
        String encodedBody = encodeParams(params);

        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(encodedBody))
            .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Flow respondio " + response.statusCode() + ": " + response.body());
        }

        return response.body();
    }

    private String getFlowPaymentStatus(String token) throws IOException, InterruptedException {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("apiKey", flowApiKey);
        params.put("token", token);
        params.put("s", sign(params));

        HttpRequest request = HttpRequest.newBuilder(URI.create(flowApiUrl + "/payment/getStatus?" + encodeParams(params)))
            .GET()
            .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Flow respondio " + response.statusCode() + " al consultar estado: " + response.body());
        }

        return response.body();
    }

    private String encodeParams(Map<String, String> params) {
        return params.entrySet().stream()
            .map(entry -> URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8) + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
            .reduce((left, right) -> left + "&" + right)
            .orElse("");
    }

    private String extractJsonValue(String json, String fieldName) {
        String pattern = "\"" + fieldName + "\"";
        int fieldIndex = json.indexOf(pattern);

        if (fieldIndex < 0) {
            throw new IllegalStateException("Flow no respondio el campo '" + fieldName + "': " + json);
        }

        int colonIndex = json.indexOf(":", fieldIndex + pattern.length());
        int valueStart = json.indexOf("\"", colonIndex + 1);
        int valueEnd = json.indexOf("\"", valueStart + 1);

        if (colonIndex < 0 || valueStart < 0 || valueEnd < 0) {
            throw new IllegalStateException("No se pudo leer el campo '" + fieldName + "' de Flow: " + json);
        }

        return json.substring(valueStart + 1, valueEnd);
    }

    private String extractOptionalJsonValue(String json, String fieldName) {
        String pattern = "\"" + fieldName + "\"";
        int fieldIndex = json.indexOf(pattern);

        if (fieldIndex < 0) {
            return null;
        }

        int colonIndex = json.indexOf(":", fieldIndex + pattern.length());
        int valueStart = colonIndex + 1;

        while (valueStart < json.length() && Character.isWhitespace(json.charAt(valueStart))) {
            valueStart++;
        }

        if (valueStart >= json.length()) {
            return null;
        }

        if (json.charAt(valueStart) == '"') {
            int valueEnd = json.indexOf("\"", valueStart + 1);
            return valueEnd < 0 ? null : json.substring(valueStart + 1, valueEnd);
        }

        int valueEnd = valueStart;
        while (valueEnd < json.length() && json.charAt(valueEnd) != ',' && json.charAt(valueEnd) != '}') {
            valueEnd++;
        }

        return json.substring(valueStart, valueEnd).trim();
    }

    private int extractJsonInt(String json, String fieldName) {
        String value = extractOptionalJsonValue(json, fieldName);

        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Flow no respondio el campo numerico '" + fieldName + "': " + json);
        }

        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException exception) {
            throw new IllegalStateException("Flow respondio un valor invalido para '" + fieldName + "': " + value, exception);
        }
    }
}
