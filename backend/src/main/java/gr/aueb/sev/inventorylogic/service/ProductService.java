package gr.aueb.sev.inventorylogic.service;

import gr.aueb.sev.inventorylogic.domain.Product;
import gr.aueb.sev.inventorylogic.domain.StockMovement;
import gr.aueb.sev.inventorylogic.repo.ProductRepo;
import gr.aueb.sev.inventorylogic.repo.StockMovementRepo;
import gr.aueb.sev.inventorylogic.dto.AdjustStockRequest;
import gr.aueb.sev.inventorylogic.dto.CreateProductRequest;
import gr.aueb.sev.inventorylogic.dto.UpdateProductRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepo repo;
    private final StockMovementRepo movementRepo;

    public ProductService(ProductRepo repo, StockMovementRepo movementRepo) {
        this.repo = repo;
        this.movementRepo = movementRepo;
    }

    public List<Product> list() {
        return repo.findAll();
    }

    @Transactional
    public Product create(CreateProductRequest req) {
        if (repo.existsBySku(req.sku())) {
            throw new IllegalArgumentException("SKU already exists: " + req.sku());
        }
        Product p = new Product();
        p.setSku(req.sku().trim());
        p.setName(req.name().trim());
        p.setCategory(req.category() != null ? req.category().trim() : null);
        p.setStock(req.stock());
        p.setMinStock(req.minStock());
        return repo.save(p);
    }

    @Transactional
    public Product update(long id, UpdateProductRequest req) {
        Product p = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        if (req.sku() != null && !req.sku().isBlank()) {
            if (repo.existsBySku(req.sku().trim()) && !req.sku().trim().equalsIgnoreCase(p.getSku())) {
                throw new IllegalArgumentException("SKU already exists: " + req.sku());
            }
            p.setSku(req.sku().trim());
        }
        if (req.name() != null && !req.name().isBlank()) p.setName(req.name().trim());
        if (req.category() != null) p.setCategory(req.category().trim().isEmpty() ? null : req.category().trim());
        if (req.minStock() != null && req.minStock() >= 0) p.setMinStock(req.minStock());
        return repo.save(p);
    }

    @Transactional
    public Product adjustStock(long id, AdjustStockRequest req) {
        Product p = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        int newStock = p.getStock() + req.delta();
        if (newStock < 0) newStock = 0;
        p.setStock(newStock);
        Product saved = repo.save(p);
        StockMovement m = new StockMovement();
        m.setProduct(saved);
        m.setDelta(req.delta());
        m.setNote(req.note());
        movementRepo.save(m);
        return saved;
    }

    public List<StockMovement> getMovements(long productId) {
        return movementRepo.findByProductIdOrderByCreatedAtDesc(productId);
    }
}
