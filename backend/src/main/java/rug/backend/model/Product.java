package rug.backend.model;

public class Product {
    private Long id;
    private String name;
    private Integer price;
    private String image;
    private String category;
    private String collection;
    private Boolean bestSeller;
    private Boolean newArrival;

    public Product() {
    }

    public Product(Long id, String name, Integer price, String image, String category, String collection, Boolean bestSeller, Boolean newArrival) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.category = category;
        this.collection = collection;
        this.bestSeller = bestSeller;
        this.newArrival = newArrival;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Integer getPrice() {
        return price;
    }

    public String getImage() {
        return image;
    }

    public String getCategory() {
        return category;
    }

    public String getCollection() {
        return collection;
    }

    public Boolean getBestSeller() {
        return bestSeller;
    }

    public Boolean getNewArrival() {
        return newArrival;
    }
}
