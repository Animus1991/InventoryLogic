package gr.aueb.sev.inventorylogic.web;

import gr.aueb.sev.inventorylogic.domain.AuditLog;
import gr.aueb.sev.inventorylogic.domain.Product;
import gr.aueb.sev.inventorylogic.domain.StockMovement;
import gr.aueb.sev.inventorylogic.dto.AdjustStockRequest;
import gr.aueb.sev.inventorylogic.dto.CreateProductRequest;
import gr.aueb.sev.inventorylogic.dto.UpdateProductRequest;
import gr.aueb.sev.inventorylogic.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public Optional<Product> getOne(@PathVariable long id) {
        return service.findById(id);
    }

    @GetMapping
    public List<Product> list(
            @RequestParam(required = false) Boolean lowStockOnly,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return service.list(Boolean.TRUE.equals(lowStockOnly), q, page, size);
    }

    @GetMapping("/by-barcode")
    public Optional<Product> byBarcode(@RequestParam String code) {
        return service.findByBarcode(code);
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

    @GetMapping("/{id}/audit")
    public List<AuditLog> audit(@PathVariable long id) {
        return service.getAuditLog(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable long id) {
        service.delete(id);
    }

    @PostMapping("/seed")
    public int seed() {
        return service.seedSampleProducts();
    }
}
