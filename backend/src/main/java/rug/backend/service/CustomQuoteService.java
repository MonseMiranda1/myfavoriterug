package rug.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import rug.backend.model.AccountUser;
import rug.backend.model.CustomQuote;
import rug.backend.repository.CustomQuoteRepository;

@Service
public class CustomQuoteService {
    private final CustomQuoteRepository customQuoteRepository;

    public CustomQuoteService(CustomQuoteRepository customQuoteRepository) {
        this.customQuoteRepository = customQuoteRepository;
    }

    public List<CustomQuote> getQuotes() {
        return customQuoteRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<CustomQuote> getQuotesForUser(AccountUser user) {
        return customQuoteRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public CustomQuote createQuote(CustomQuote quote, AccountUser user) {
        if (user != null) {
            quote.setUser(user);
            quote.setCustomerName(defaultText(quote.getCustomerName(), user.getName()));
            quote.setEmail(defaultText(quote.getEmail(), user.getEmail()));
            quote.setPhone(defaultText(quote.getPhone(), user.getPhone()));
            quote.setRut(defaultText(quote.getRut(), user.getRut()));
            quote.setAddress(defaultText(quote.getAddress(), user.getAddress()));
        }

        quote.setCustomerName(requireText(quote.getCustomerName(), "El nombre es obligatorio."));
        quote.setEmail(requireText(quote.getEmail(), "El correo es obligatorio."));
        quote.setImageName(requireText(quote.getImageName(), "La imagen es obligatoria."));
        quote.setSize(requireText(quote.getSize(), "La medida es obligatoria."));
        quote.setWool(requireText(quote.getWool(), "La lana es obligatoria."));
        quote.setColors(requireText(quote.getColors(), "Los colores son obligatorios."));
        quote.setCurrency(defaultText(quote.getCurrency(), "CLP"));
        quote.setComments(defaultText(quote.getComments(), ""));

        if (quote.getTotalClp() == null || quote.getTotalClp() < 0) {
            throw new IllegalArgumentException("El total de la cotizacion no es valido.");
        }

        return customQuoteRepository.save(quote);
    }

    public void deleteQuote(Long id) {
        customQuoteRepository.deleteById(id);
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return value.trim();
    }

    private String defaultText(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback == null ? "" : fallback;
        }

        return value.trim();
    }
}
