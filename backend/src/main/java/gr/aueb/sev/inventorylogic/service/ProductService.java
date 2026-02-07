package gr.aueb.sev.inventorylogic.service;

import gr.aueb.sev.inventorylogic.domain.AuditLog;
import gr.aueb.sev.inventorylogic.domain.Product;
import gr.aueb.sev.inventorylogic.domain.StockMovement;
import gr.aueb.sev.inventorylogic.repo.AuditLogRepo;
import gr.aueb.sev.inventorylogic.repo.ProductRepo;
import gr.aueb.sev.inventorylogic.repo.StockMovementRepo;
import gr.aueb.sev.inventorylogic.dto.AdjustStockRequest;
import gr.aueb.sev.inventorylogic.dto.CreateProductRequest;
import gr.aueb.sev.inventorylogic.dto.UpdateProductRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepo repo;
    private final StockMovementRepo movementRepo;
    private final AuditLogRepo auditLogRepo;

    public ProductService(ProductRepo repo, StockMovementRepo movementRepo, AuditLogRepo auditLogRepo) {
        this.repo = repo;
        this.movementRepo = movementRepo;
        this.auditLogRepo = auditLogRepo;
    }

    public Optional<Product> findById(long id) {
        return repo.findById(id);
    }

    public List<Product> list(boolean lowStockOnly, String q, Integer page, Integer size) {
        List<Product> list;
        if (q != null && !q.isBlank()) {
            Pageable pageable = size != null && size > 0 ? PageRequest.of(page != null && page >= 0 ? page : 0, size) : Pageable.unpaged();
            list = repo.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrBarcodeContainingIgnoreCaseOrCategoryContainingIgnoreCase(q, q, q, q, pageable).getContent();
        } else if (size != null && size > 0) {
            list = repo.findAll(PageRequest.of(page != null && page >= 0 ? page : 0, size)).getContent();
        } else {
            list = repo.findAll();
        }
        if (lowStockOnly) {
            return list.stream().filter(p -> p.getMinStock() > 0 && p.getStock() <= p.getMinStock()).toList();
        }
        return list;
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
        p.setBarcode(req.barcode() != null ? req.barcode().trim() : null);
        p.setUnit(req.unit() != null && !req.unit().isBlank() ? req.unit().trim() : "τεμάχια");
        p.setDescription(req.description() != null ? req.description().trim() : null);
        p.setPrice(req.price());
        p.setLocation(req.location() != null ? req.location().trim() : null);
        p.setDimensions(req.dimensions() != null ? req.dimensions().trim() : null);
        p.setColorRal(req.colorRal() != null ? req.colorRal().trim() : null);
        p.setPackagingInfo(req.packagingInfo() != null ? req.packagingInfo().trim() : null);
        p.setStock(req.stock());
        p.setMinStock(req.minStock());
        Product saved = repo.save(p);
        audit("CREATE", saved.getId(), saved.getSku() + " " + saved.getName());
        return saved;
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
        if (req.barcode() != null) p.setBarcode(req.barcode().trim().isEmpty() ? null : req.barcode().trim());
        if (req.unit() != null && !req.unit().isBlank()) p.setUnit(req.unit().trim());
        if (req.description() != null) p.setDescription(req.description().trim().isEmpty() ? null : req.description().trim());
        if (req.price() != null) p.setPrice(req.price());
        if (req.location() != null) p.setLocation(req.location().trim().isEmpty() ? null : req.location().trim());
        if (req.dimensions() != null) p.setDimensions(req.dimensions().trim().isEmpty() ? null : req.dimensions().trim());
        if (req.colorRal() != null) p.setColorRal(req.colorRal().trim().isEmpty() ? null : req.colorRal().trim());
        if (req.packagingInfo() != null) p.setPackagingInfo(req.packagingInfo().trim().isEmpty() ? null : req.packagingInfo().trim());
        if (req.minStock() != null && req.minStock() >= 0) p.setMinStock(req.minStock());
        Product saved = repo.save(p);
        audit("UPDATE", saved.getId(), saved.getSku());
        return saved;
    }

    @Transactional
    public void delete(long id) {
        Product p = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        audit("DELETE", id, p.getSku() + " " + p.getName());
        repo.deleteById(id);
    }

    private void audit(String action, Long productId, String details) {
        AuditLog log = new AuditLog();
        log.setProductId(productId);
        log.setAction(action);
        log.setDetails(details);
        auditLogRepo.save(log);
    }

    public Optional<Product> findByBarcode(String barcode) {
        return repo.findByBarcode(barcode);
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
        m.setReference(req.reference() != null ? req.reference().trim() : null);
        movementRepo.save(m);
        audit("ADJUST", saved.getId(), "delta=" + req.delta() + (req.note() != null ? " " + req.note() : ""));
        return saved;
    }

    public List<StockMovement> getMovements(long productId) {
        return movementRepo.findByProductIdOrderByCreatedAtDesc(productId);
    }

    /** Δειγματική λίστα προϊόντων αλουμινίου/σιδήρας. */
    @Transactional
    public int seedSampleProducts() {
        var samples = List.of(
                createSeed("AL-PORTA-001", "Πολυεστέρας πόρτας αλουμινίου 2θυρο", "Πορτοπαράθυρα αλουμίνιο", "5901234567890", "τεμάχια", "Πολυεστέρας 2 θυρών, λευκό RAL", null, "A-1", "120x220", "9010", null, 10, 2),
                createSeed("AL-PORTA-002", "Πολυεστέρας πόρτας αλουμινίου 1θυρο", "Πορτοπαράθυρα αλουμίνιο", "5901234567891", "τεμάχια", "Πολυεστέρας 1 θυρό", null, "A-1", "100x210", "9010", null, 8, 2),
                createSeed("AL-PAR-001", "Πλαίσιο παράθυρου αλουμινίου 120x140", "Πλαίσια αλουμίνιο", "5901234567892", "τεμάχια", "Πλαίσιο τυπικό 120x140 cm", null, "B-2", "120x140", null, null, 25, 5),
                createSeed("AL-PAR-002", "Πλαίσιο παράθυρου αλουμινίου 100x120", "Πλαίσια αλουμίνιο", "5901234567893", "τεμάχια", "Πλαίσιο 100x120 cm", null, "B-2", "100x120", null, null, 30, 5),
                createSeed("AL-SID-001", "Σιδεράκι αλουμινίου 2mm", "Εξαρτήματα αλουμίνιο", "5901234567894", "τεμάχια", "Σιδεράκι συναρμολόγησης 2mm", null, "C-3", null, null, "κουτί x 100", 500, 100),
                createSeed("AL-SID-002", "Σιδεράκι αλουμινίου 3mm", "Εξαρτήματα αλουμίνιο", "5901234567895", "τεμάχια", "Σιδεράκι 3mm", null, "C-3", null, null, "κουτί x 100", 400, 80),
                createSeed("AL-GL-001", "Γυαλί μονό 4mm", "Γυαλιά", "5901234567896", "τ.μ.", "Γυαλί μονό 4mm (τ.μ.)", null, "D-1", null, null, null, 0, 10),
                createSeed("AL-GL-002", "Γυαλί διπλό 4/16/4", "Γυαλιά", "5901234567897", "τ.μ.", "Διπλό γυαλί θερμομονωτικό", null, "D-1", null, null, null, 0, 8),
                createSeed("SI-KAG-001", "Λαμαρίνα καγγελόπορτας 2.00x1.00", "Καγγελόπορτες σίδηρας", "5901234567898", "τεμάχια", "Λαμαρίνα 2x1 m, βαφή σκόνης", null, "E-1", "200x100 cm", null, null, 15, 3),
                createSeed("SI-KAG-002", "Λαμαρίνα καγγελόπορτας 2.50x1.20", "Καγγελόπορτες σίδηρας", "5901234567899", "τεμάχια", "Λαμαρίνα 2.50x1.20 m", null, "E-1", "250x120 cm", null, null, 12, 3),
                createSeed("SI-AN-001", "Αντάπτορα καγγελόπορτας", "Εξαρτήματα σίδηρας", "5901234567900", "τεμάχια", "Αντάπτορας μεταλλικός", null, "E-2", null, null, null, 80, 20),
                createSeed("SI-KL-001", "Κλειδαριά καγγελόπορτας", "Εξαρτήματα σίδηρας", "5901234567901", "τεμάχια", "Κλειδαριά 3 σημείων", null, "E-2", null, null, null, 45, 10),
                createSeed("SI-PE-001", "Πετάλες πόρτας σιδήρου", "Εξαρτήματα σίδηρας", "5901234567902", "ζευγάρια", "Πετάλες για πόρτα εσωτερική", null, "E-3", null, null, "ζευγάρι", 60, 15),
                createSeed("AL-AN-001", "Αντικλειδωτικό σύστημα αλουμινίου", "Εξαρτήματα αλουμίνιο", "5901234567903", "τεμάχια", "Αντικλειδωτικό για πολυεστέρα", null, "A-2", null, null, null, 35, 8),
                createSeed("AL-TAP-001", "Ταπετσαρία εσωτερική αλουμινίου", "Εξαρτήματα αλουμίνιο", "5901234567904", "τεμάχια", "Ταπετσαρία εσωτερικού πλαισίου", null, "A-2", null, null, null, 200, 40)
        );
        int added = 0;
        for (var req : samples) {
            if (!repo.existsBySku(req.sku())) {
                create(req);
                added++;
            }
        }
        return added;
    }

    private static CreateProductRequest createSeed(String sku, String name, String cat, String bar, String unit, String desc,
            java.math.BigDecimal price, String loc, String dim, String ral, String pack, int stock, int min) {
        return new CreateProductRequest(sku, name, cat, bar, unit, desc, price, loc, dim, ral, pack, stock, min);
    }

    public List<AuditLog> getAuditLog(Long productId) {
        return productId != null ? auditLogRepo.findByProductIdOrderByCreatedAtDesc(productId) : List.of();
    }
}
