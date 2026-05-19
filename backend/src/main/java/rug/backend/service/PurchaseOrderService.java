package rug.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import rug.backend.model.PurchaseOrder;
import rug.backend.repository.PurchaseOrderRepository;

@Service
public class PurchaseOrderService {
    private final PurchaseOrderRepository purchaseOrderRepository;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public List<PurchaseOrder> getPurchaseOrders() {
        return purchaseOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    public PurchaseOrder savePurchaseOrder(PurchaseOrder purchaseOrder) {
        purchaseOrder.setClient(requireText(purchaseOrder.getClient(), "El cliente es obligatorio."));
        purchaseOrder.setProvider(requireText(purchaseOrder.getProvider(), "El proveedor es obligatorio."));
        purchaseOrder.setStatus(defaultText(purchaseOrder.getStatus(), "Solicitada"));
        purchaseOrder.setNotes(defaultText(purchaseOrder.getNotes(), ""));

        if (purchaseOrder.getTotal() == null || purchaseOrder.getTotal() < 0) {
            throw new IllegalArgumentException("El total no es valido.");
        }

        return purchaseOrderRepository.save(purchaseOrder);
    }

    public PurchaseOrder updatePurchaseOrder(Long id, PurchaseOrder input) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id).orElse(null);

        if (purchaseOrder == null) {
            return null;
        }

        if (input.getClient() != null) {
            purchaseOrder.setClient(requireText(input.getClient(), "El cliente es obligatorio."));
        }

        if (input.getProvider() != null) {
            purchaseOrder.setProvider(requireText(input.getProvider(), "El proveedor es obligatorio."));
        }

        if (input.getStatus() != null) {
            purchaseOrder.setStatus(defaultText(input.getStatus(), "Solicitada"));
        }

        if (input.getTotal() != null) {
            purchaseOrder.setTotal(input.getTotal());
        }

        if (input.getRelatedOrderNumber() != null) {
            purchaseOrder.setRelatedOrderNumber(defaultText(input.getRelatedOrderNumber(), ""));
        }

        if (input.getNotes() != null) {
            purchaseOrder.setNotes(defaultText(input.getNotes(), ""));
        }

        return savePurchaseOrder(purchaseOrder);
    }

    public void deletePurchaseOrder(Long id) {
        purchaseOrderRepository.deleteById(id);
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return value.trim();
    }

    private String defaultText(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }

        return value.trim();
    }
}
