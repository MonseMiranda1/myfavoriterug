package rug.backend.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import rug.backend.model.Product;

@Repository
public class ProductRepository {
    private static final String PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80";

    private final List<Product> products = List.of(
        new Product(101L, "Custom Logo Rug", 89000, PLACEHOLDER_IMAGE, "Custom Rugs", "Custom Rugs", true, false),
        new Product(102L, "Anime Hero Rug", 99000, PLACEHOLDER_IMAGE, "Anime Collection", "Anime Collection", true, true),
        new Product(103L, "Gaming Controller Rug", 76000, PLACEHOLDER_IMAGE, "Gaming Collection", "Gaming Collection", false, true),
        new Product(104L, "Kawaii Heart Rug", 69000, PLACEHOLDER_IMAGE, "Kawaii Collection", "Kawaii Collection", false, false),
        new Product(105L, "Minimal Cloud Rug", 59000, PLACEHOLDER_IMAGE, "Minimal Collection", "Minimal Collection", false, false)
    );

    public List<Product> findAll() {
        return products;
    }

    public Product findById(Long id) {
        return products.stream()
            .filter(product -> product.getId().equals(id))
            .findFirst()
            .orElse(null);
    }
}
