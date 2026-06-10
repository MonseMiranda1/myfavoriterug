package rug.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import rug.backend.model.Product;
import rug.backend.repository.ProductRepository;

@Component
public class DataSeeder implements CommandLineRunner {
    private static final String PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80";

    private final ProductRepository productRepository;

    public DataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            productRepository.save(new Product("Custom Logo Rug", 89000, PLACEHOLDER_IMAGE, "60 x 90 cm", "Disponible", "Custom Rugs", "Custom Rugs", true, false));
            productRepository.save(new Product("Anime Hero Rug", 99000, PLACEHOLDER_IMAGE, "80 x 120 cm", "Disponible", "Anime Collection", "Anime Collection", true, true));
            productRepository.save(new Product("Gaming Controller Rug", 76000, PLACEHOLDER_IMAGE, "60 x 80 cm", "Disponible", "Gaming Collection", "Gaming Collection", false, true));
            productRepository.save(new Product("Kawaii Heart Rug", 69000, PLACEHOLDER_IMAGE, "50 x 70 cm", "Disponible", "Kawaii Collection", "Kawaii Collection", false, false));
            productRepository.save(new Product("Minimal Cloud Rug", 59000, PLACEHOLDER_IMAGE, "50 x 60 cm", "Disponible", "Minimal Collection", "Minimal Collection", false, false));
        }

    }
}
