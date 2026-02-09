package gr.aueb.sev.inventorylogic.web;

import gr.aueb.sev.inventorylogic.domain.AuditLog;
import gr.aueb.sev.inventorylogic.domain.Product;
import gr.aueb.sev.inventorylogic.domain.StockMovement;
import gr.aueb.sev.inventorylogic.dto.AdjustStockRequest;
import gr.aueb.sev.inventorylogic.dto.CreateProductRequest;
import gr.aueb.sev.inventorylogic.dto.ProductPageResponse;
import gr.aueb.sev.inventorylogic.dto.UpdateProductRequest;
import gr.aueb.sev.inventorylogic.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getOne(@PathVariable long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ProductPageResponse list(
            @RequestParam(required = false) Boolean lowStockOnly,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return service.list(Boolean.TRUE.equals(lowStockOnly), q, page, size);
    }

    @GetMapping("/by-barcode")
    public ResponseEntity<Product> byBarcode(@RequestParam String code) {
        return service.findByBarcode(code)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> create(@Valid @RequestBody CreateProductRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable long id, @Valid @RequestBody UpdateProductRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @PostMapping("/{id}/adjust")
    public ResponseEntity<Product> adjust(@PathVariable long id, @Valid @RequestBody AdjustStockRequest req) {
        return ResponseEntity.ok(service.adjustStock(id, req));
    }

    @GetMapping("/{id}/movements")
    public ResponseEntity<List<StockMovement>> movements(@PathVariable long id) {
        return ResponseEntity.ok(service.getMovements(id));
    }

    @GetMapping("/{id}/audit")
    public ResponseEntity<List<AuditLog>> audit(@PathVariable long id) {
        return ResponseEntity.ok(service.getAuditLog(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/seed")
    public int seed() {
        return service.seedSampleProducts();
    }
}
