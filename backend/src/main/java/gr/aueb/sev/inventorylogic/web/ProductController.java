package gr.aueb.sev.inventorylogic.web;

import gr.aueb.sev.inventorylogic.domain.Product;
import gr.aueb.sev.inventorylogic.domain.StockMovement;
import gr.aueb.sev.inventorylogic.dto.AdjustStockRequest;
import gr.aueb.sev.inventorylogic.dto.CreateProductRequest;
import gr.aueb.sev.inventorylogic.dto.UpdateProductRequest;
import gr.aueb.sev.inventorylogic.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> list() {
        return service.list();
    }

    @PostMapping
    public Product create(@Valid @RequestBody CreateProductRequest req) {
        return service.create(req);
    }

    @PatchMapping("/{id}")
    public Product update(@PathVariable long id, @Valid @RequestBody UpdateProductRequest req) {
        return service.update(id, req);
    }

    @PostMapping("/{id}/adjust")
    public Product adjust(@PathVariable long id, @Valid @RequestBody AdjustStockRequest req) {
        return service.adjustStock(id, req);
    }

    @GetMapping("/{id}/movements")
    public List<StockMovement> movements(@PathVariable long id) {
        return service.getMovements(id);
    }
}
