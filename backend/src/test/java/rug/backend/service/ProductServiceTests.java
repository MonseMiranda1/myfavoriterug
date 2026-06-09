package rug.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import rug.backend.model.Product;
import rug.backend.repository.ProductRepository;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:product-service-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class ProductServiceTests {
    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void cleanDatabase() {
        productRepository.deleteAll();
    }

    @Test
    void updateProductPersistsFieldsAndReplacesImages() {
        Product product = productService.createProduct(productInput("Nezuko", 150000, List.of("https://example.com/old.jpg")));

        Product updated = productService.updateProduct(
            product.getId(),
            productInput("Nezuko editada", 160000, List.of("https://example.com/new.jpg", "https://example.com/second.jpg"))
        );

        Product persisted = productRepository.findById(product.getId()).orElseThrow();
        assertThat(updated).isNotNull();
        assertThat(persisted.getName()).isEqualTo("Nezuko editada");
        assertThat(persisted.getPrice()).isEqualTo(160000);
        assertThat(persisted.getImage()).isEqualTo("https://example.com/new.jpg");
        assertThat(persisted.getImages()).containsExactlyInAnyOrder(
            "https://example.com/new.jpg",
            "https://example.com/second.jpg"
        );
    }

    private Product productInput(String name, int price, List<String> images) {
        Product product = new Product();
        product.setName(name);
        product.setPrice(price);
        product.setImage(images.get(0));
        product.setImages(new ArrayList<>(images));
        product.setSize("100x150");
        product.setAvailability("Disponible");
        product.setCategory("Anime Collection");
        product.setCollection("Anime Collection");
        product.setBestSeller(false);
        product.setNewArrival(true);
        return product;
    }
}
