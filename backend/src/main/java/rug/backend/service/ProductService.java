package rug.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import rug.backend.model.Product;
import rug.backend.repository.ProductRepository;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    public Product getProduct(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product createProduct(Product product) {
        product.setId(null);
        normalizeImages(product);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product product) {
        Product currentProduct = getProduct(id);

        if (currentProduct == null) {
            return null;
        }

        normalizeImages(product);
        currentProduct.setName(product.getName());
        currentProduct.setPrice(product.getPrice());
        currentProduct.setImage(product.getImage());
        currentProduct.setImages(product.getImages());
        currentProduct.setSize(product.getSize());
        currentProduct.setAvailability(product.getAvailability());
        currentProduct.setCategory(product.getCategory());
        currentProduct.setCollection(product.getCollection());
        currentProduct.setBestSeller(product.getBestSeller());
        currentProduct.setNewArrival(product.getNewArrival());

        return productRepository.save(currentProduct);
    }

    public boolean deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            return false;
        }

        productRepository.deleteById(id);
        return true;
    }

    private void normalizeImages(Product product) {
        List<String> images = product.getImages();

        if (images == null || images.isEmpty()) {
            if (product.getImage() == null || product.getImage().isBlank()) {
                throw new IllegalArgumentException("El producto debe tener al menos una imagen.");
            }

            product.setImages(List.of(product.getImage()));
            return;
        }

        product.setImages(images.stream().filter(image -> image != null && !image.isBlank()).toList());

        if (product.getImages().isEmpty()) {
            if (product.getImage() == null || product.getImage().isBlank()) {
                throw new IllegalArgumentException("El producto debe tener al menos una imagen.");
            }

            product.setImages(List.of(product.getImage()));
            return;
        }

        if ((product.getImage() == null || product.getImage().isBlank()) && !product.getImages().isEmpty()) {
            product.setImage(product.getImages().get(0));
        }
    }
}
