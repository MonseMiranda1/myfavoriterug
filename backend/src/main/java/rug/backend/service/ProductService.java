package rug.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public Product createProduct(Product product) {
        product.setId(null);
        validateAndNormalize(product);
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product product) {
        Product currentProduct = getProduct(id);

        if (currentProduct == null) {
            return null;
        }

        validateAndNormalize(product);
        currentProduct.setName(product.getName());
        currentProduct.setPrice(product.getPrice());
        currentProduct.setImage(product.getImage());
        currentProduct.getImages().clear();
        currentProduct.getImages().addAll(product.getImages());
        currentProduct.setSize(product.getSize());
        currentProduct.setAvailability(product.getAvailability());
        currentProduct.setCategory(product.getCategory());
        currentProduct.setCollection(product.getCollection());
        currentProduct.setBestSeller(product.getBestSeller());
        currentProduct.setNewArrival(product.getNewArrival());

        return currentProduct;
    }

    public boolean deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            return false;
        }

        productRepository.deleteById(id);
        return true;
    }

    private void validateAndNormalize(Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio.");
        }

        if (product.getPrice() == null || product.getPrice() < 0) {
            throw new IllegalArgumentException("El precio del producto no es valido.");
        }

        product.setName(product.getName().trim());

        List<String> images = product.getImages();

        if (images == null || images.isEmpty()) {
            if (product.getImage() == null || product.getImage().isBlank()) {
                throw new IllegalArgumentException("El producto debe tener al menos una imagen.");
            }

            product.setImages(new ArrayList<>(List.of(product.getImage().trim())));
            return;
        }

        product.setImages(images.stream()
            .filter(image -> image != null && !image.isBlank())
            .map(String::trim)
            .collect(java.util.stream.Collectors.toCollection(ArrayList::new)));

        if (product.getImages().isEmpty()) {
            if (product.getImage() == null || product.getImage().isBlank()) {
                throw new IllegalArgumentException("El producto debe tener al menos una imagen.");
            }

            product.setImages(new ArrayList<>(List.of(product.getImage().trim())));
            return;
        }

        if ((product.getImage() == null || product.getImage().isBlank()) && !product.getImages().isEmpty()) {
            product.setImage(product.getImages().get(0));
        } else {
            product.setImage(product.getImage().trim());
        }
    }
}
