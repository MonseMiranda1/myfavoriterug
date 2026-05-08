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
        return productRepository.findById(id);
    }
}
