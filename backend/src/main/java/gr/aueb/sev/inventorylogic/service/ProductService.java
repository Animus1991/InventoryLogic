package gr.aueb.sev.inventorylogic.service;

import gr.aueb.sev.inventorylogic.domain.AuditLog;
import gr.aueb.sev.inventorylogic.domain.Product;
import gr.aueb.sev.inventorylogic.domain.StockMovement;
import gr.aueb.sev.inventorylogic.dto.AdjustStockRequest;
import gr.aueb.sev.inventorylogic.dto.CreateProductRequest;
import gr.aueb.sev.inventorylogic.dto.ImportResult;
import gr.aueb.sev.inventorylogic.dto.ProductPageResponse;
import gr.aueb.sev.inventorylogic.dto.UpdateProductRequest;
import gr.aueb.sev.inventorylogic.exception.InsufficientStockException;
import gr.aueb.sev.inventorylogic.exception.ProductNotFoundException;
import gr.aueb.sev.inventorylogic.exception.SkuAlreadyExistsException;
import gr.aueb.sev.inventorylogic.repo.AuditLogRepo;
import gr.aueb.sev.inventorylogic.repo.ProductRepo;
import gr.aueb.sev.inventorylogic.repo.StockMovementRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
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

    public ProductPageResponse list(boolean lowStockOnly, String q, Integer page, Integer size) {
        Pageable pageable = size != null && size > 0
                ? PageRequest.of(page != null && page >= 0 ? page : 0, size)
                : Pageable.unpaged();

        Page<Product> resultPage;
        if (q != null && !q.isBlank()) {
            resultPage = repo.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCaseOrBarcodeContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                    q, q, q, q, pageable);
        } else if (pageable.isPaged()) {
            resultPage = repo.findAll(pageable);
        } else {
            List<Product> all = repo.findAll();
            if (lowStockOnly) {
                all = all.stream().filter(p -> p.getMinStock() > 0 && p.getStock() <= p.getMinStock()).toList();
            }
            return new ProductPageResponse(all, all.size(), 0, all.size());
        }

        List<Product> items = resultPage.getContent();
        if (lowStockOnly) {
            items = items.stream().filter(p -> p.getMinStock() > 0 && p.getStock() <= p.getMinStock()).toList();
        }
        return new ProductPageResponse(items, resultPage.getTotalElements(), resultPage.getNumber(), resultPage.getSize());
    }

    @Transactional
    public Product create(CreateProductRequest req) {
        if (repo.existsBySku(req.sku())) {
            throw new SkuAlreadyExistsException(req.sku());
        }
        Product p = new Product();
        p.setSku(req.sku().trim());
        p.setName(req.name().trim());
        p.setCategory(req.category() != null ? req.category().trim() : null);
        p.setBarcode(req.barcode() != null ? req.barcode().trim() : null);
        p.setQrCode(req.qrCode() != null ? req.qrCode().trim().isEmpty() ? null : req.qrCode().trim() : null);
        p.setUnit(req.unit() != null && !req.unit().isBlank() ? req.unit().trim() : "τεμάχια");
        p.setDescription(req.description() != null ? req.description().trim() : null);
        p.setManufacturerTerm(req.manufacturerTerm() != null ? req.manufacturerTerm().trim() : null);
        p.setLocalSlang(req.localSlang() != null ? req.localSlang().trim() : null);
        p.setPrice(req.price());
        p.setLocation(req.location() != null ? req.location().trim() : null);
        p.setDimensions(req.dimensions() != null ? req.dimensions().trim() : null);
        p.setColorRal(req.colorRal() != null ? req.colorRal().trim() : null);
        p.setPackagingInfo(req.packagingInfo() != null ? req.packagingInfo().trim() : null);
        p.setSupplier(req.supplier() != null ? req.supplier().trim().isEmpty() ? null : req.supplier().trim() : null);
        p.setInternalNotes(req.internalNotes() != null ? req.internalNotes().trim().isEmpty() ? null : req.internalNotes().trim() : null);
        p.setStock(req.stock());
        p.setMinStock(req.minStock());
        Product saved = repo.save(p);
        audit("CREATE", saved.getId(), saved.getSku() + " " + saved.getName());
        return saved;
    }

    @Transactional
    public Product update(long id, UpdateProductRequest req) {
        Product p = repo.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
        if (req.sku() != null && !req.sku().isBlank()) {
            if (repo.existsBySku(req.sku().trim()) && !req.sku().trim().equalsIgnoreCase(p.getSku())) {
                throw new SkuAlreadyExistsException(req.sku());
            }
            p.setSku(req.sku().trim());
        }
        if (req.name() != null && !req.name().isBlank()) p.setName(req.name().trim());
        if (req.category() != null) p.setCategory(req.category().trim().isEmpty() ? null : req.category().trim());
        if (req.barcode() != null) p.setBarcode(req.barcode().trim().isEmpty() ? null : req.barcode().trim());
        if (req.qrCode() != null) p.setQrCode(req.qrCode().trim().isEmpty() ? null : req.qrCode().trim());
        if (req.unit() != null && !req.unit().isBlank()) p.setUnit(req.unit().trim());
        if (req.description() != null) p.setDescription(req.description().trim().isEmpty() ? null : req.description().trim());
        if (req.manufacturerTerm() != null) p.setManufacturerTerm(req.manufacturerTerm().trim().isEmpty() ? null : req.manufacturerTerm().trim());
        if (req.localSlang() != null) p.setLocalSlang(req.localSlang().trim().isEmpty() ? null : req.localSlang().trim());
        if (req.price() != null) p.setPrice(req.price());
        if (req.location() != null) p.setLocation(req.location().trim().isEmpty() ? null : req.location().trim());
        if (req.dimensions() != null) p.setDimensions(req.dimensions().trim().isEmpty() ? null : req.dimensions().trim());
        if (req.colorRal() != null) p.setColorRal(req.colorRal().trim().isEmpty() ? null : req.colorRal().trim());
        if (req.packagingInfo() != null) p.setPackagingInfo(req.packagingInfo().trim().isEmpty() ? null : req.packagingInfo().trim());
        if (req.supplier() != null) p.setSupplier(req.supplier().trim().isEmpty() ? null : req.supplier().trim());
        if (req.internalNotes() != null) p.setInternalNotes(req.internalNotes().trim().isEmpty() ? null : req.internalNotes().trim());
        if (req.minStock() != null && req.minStock() >= 0) p.setMinStock(req.minStock());
        Product saved = repo.save(p);
        audit("UPDATE", saved.getId(), saved.getSku());
        return saved;
    }

    @Transactional
    public void delete(long id) {
        Product p = repo.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
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
        Product p = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Δεν βρέθηκε προϊόν με id: " + id));
        int newStock = p.getStock() + req.delta();
        if (newStock < 0) {
            throw new InsufficientStockException(p.getSku(), req.delta(), p.getStock());
        }
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
                createSeed("AL-PORTA-001", "Πολυεστέρας πόρτας αλουμινίου 2θυρο", "Πορτοπαράθυρα αλουμίνιο", "5901234567890", null, "τεμάχια", "Πολυεστέρας 2 θυρών, λευκό RAL", null, null, null, "A-1", "120x220", "9010", null, null, null, 10, 2),
                createSeed("AL-PORTA-002", "Πολυεστέρας πόρτας αλουμινίου 1θυρο", "Πορτοπαράθυρα αλουμίνιο", "5901234567891", null, "τεμάχια", "Πολυεστέρας 1 θυρό", null, null, null, "A-1", "100x210", "9010", null, null, null, 8, 2),
                createSeed("AL-PAR-001", "Πλαίσιο παράθυρου αλουμινίου 120x140", "Πλαίσια αλουμίνιο", "5901234567892", null, "τεμάχια", "Πλαίσιο τυπικό 120x140 cm", null, null, null, "B-2", "120x140", null, null, null, null, 25, 5),
                createSeed("AL-PAR-002", "Πλαίσιο παράθυρου αλουμινίου 100x120", "Πλαίσια αλουμίνιο", "5901234567893", null, "τεμάχια", "Πλαίσιο 100x120 cm", null, null, null, "B-2", "100x120", null, null, null, null, 30, 5),
                createSeed("AL-SID-001", "Σιδεράκι αλουμινίου 2mm", "Εξαρτήματα αλουμίνιο", "5901234567894", null, "τεμάχια", "Σιδεράκι συναρμολόγησης 2mm", null, null, null, "C-3", null, null, "κουτί x 100", null, null, 500, 100),
                createSeed("AL-SID-002", "Σιδεράκι αλουμινίου 3mm", "Εξαρτήματα αλουμίνιο", "5901234567895", null, "τεμάχια", "Σιδεράκι 3mm", null, null, null, "C-3", null, null, "κουτί x 100", null, null, 400, 80),
                createSeed("AL-GL-001", "Γυαλί μονό 4mm", "Γυαλιά", "5901234567896", null, "τ.μ.", "Γυαλί μονό 4mm (τ.μ.)", null, null, null, "D-1", null, null, null, null, null, 0, 10),
                createSeed("AL-GL-002", "Γυαλί διπλό 4/16/4", "Γυαλιά", "5901234567897", null, "τ.μ.", "Διπλό γυαλί θερμομονωτικό", null, null, null, "D-1", null, null, null, null, null, 0, 8),
                createSeed("SI-KAG-001", "Λαμαρίνα καγγελόπορτας 2.00x1.00", "Καγγελόπορτες σίδηρας", "5901234567898", null, "τεμάχια", "Λαμαρίνα 2x1 m, βαφή σκόνης", null, null, null, "E-1", "200x100 cm", null, null, null, null, 15, 3),
                createSeed("SI-KAG-002", "Λαμαρίνα καγγελόπορτας 2.50x1.20", "Καγγελόπορτες σίδηρας", "5901234567899", null, "τεμάχια", "Λαμαρίνα 2.50x1.20 m", null, null, null, "E-1", "250x120 cm", null, null, null, null, 12, 3),
                createSeed("SI-AN-001", "Αντάπτορα καγγελόπορτας", "Εξαρτήματα σίδηρας", "5901234567900", null, "τεμάχια", "Αντάπτορας μεταλλικός", null, null, null, "E-2", null, null, null, null, null, 80, 20),
                createSeed("SI-KL-001", "Κλειδαριά καγγελόπορτας", "Εξαρτήματα σίδηρας", "5901234567901", null, "τεμάχια", "Κλειδαριά 3 σημείων", null, null, null, "E-2", null, null, null, null, null, 45, 10),
                createSeed("SI-PE-001", "Πετάλες πόρτας σιδήρου", "Εξαρτήματα σίδηρας", "5901234567902", null, "ζευγάρια", "Πετάλες για πόρτα εσωτερική", null, null, null, "E-3", null, null, "ζευγάρι", null, null, 60, 15),
                createSeed("AL-AN-001", "Αντικλειδωτικό σύστημα αλουμινίου", "Εξαρτήματα αλουμίνιο", "5901234567903", null, "τεμάχια", "Αντικλειδωτικό για πολυεστέρα", null, null, null, "A-2", null, null, null, null, null, 35, 8),
                createSeed("AL-TAP-001", "Ταπετσαρία εσωτερική αλουμινίου", "Εξαρτήματα αλουμίνιο", "5901234567904", null, "τεμάχια", "Ταπετσαρία εσωτερικού πλαισίου", null, null, null, "A-2", null, null, null, null, null, 200, 40)
        );
        int added = 0;
        for (var req : samples) {
            if (req == null || req.sku() == null || req.sku().isBlank()) continue;
            try {
                if (!repo.existsBySku(req.sku())) {
                    create(req);
                    added++;
                }
            } catch (Exception e) {
                // Log and skip problematic seeds instead of failing seed process
                System.err.println("Failed to insert sample product with SKU: " + req.sku() + " - " + e.getMessage());
            }
        }
        return added;
    }

    private static CreateProductRequest createSeed(String sku, String name, String cat, String bar, String qrCode, String unit, String desc,
            String manufacturerTerm, String localSlang, java.math.BigDecimal price, String loc, String dim, String ral, String pack, String supplier, String internalNotes, int stock, int min) {
        return new CreateProductRequest(sku, name, cat, bar, qrCode, unit, desc, manufacturerTerm, localSlang, price, loc, dim, ral, pack, supplier, internalNotes, stock, min);
    }

    public List<AuditLog> getAuditLog(Long productId) {
        return productId != null ? auditLogRepo.findByProductIdOrderByCreatedAtDesc(productId) : List.of();
    }

    /**
     * Μαζική εισαγωγή από CSV. Πρώτη γραμμή = headers. Ίδια στήλες με Excel.
     */
    @Transactional
    public ImportResult importFromCsv(byte[] csvBytes) {
        String content = new String(csvBytes, StandardCharsets.UTF_8);
        String[] lines = content.split("\\r?\\n");
        if (lines.length < 2) {
            return new ImportResult(0, 0, List.of("Το αρχείο πρέπει να έχει επικεφαλίδα και τουλάχιστον μία γραμμή δεδομένων."));
        }
        String[] headers = parseCsvLine(lines[0]);
        List<String[]> dataRows = new ArrayList<>();
        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;
            dataRows.add(parseCsvLine(line));
        }
        return processImportRows(headers, dataRows);
    }

    /**
     * Μαζική εισαγωγή από Excel (.xlsx ή .xls). Πρώτη γραμμή = headers, ίδιες στήλες με CSV.
     */
    @Transactional
    public ImportResult importFromExcel(byte[] excelBytes) {
        List<String[]> allRows = new ArrayList<>();
        try (InputStream is = new ByteArrayInputStream(excelBytes);
             Workbook wb = excelBytes.length > 4 && excelBytes[0] == (byte) 0x50 && excelBytes[1] == (byte) 0x4B
                     ? new XSSFWorkbook(is)
                     : new HSSFWorkbook(is)) {
            Sheet sheet = wb.getSheetAt(0);
            for (Row row : sheet) {
                List<String> cells = new ArrayList<>();
                for (int c = 0; c < 20; c++) {
                    Cell cell = row.getCell(c);
                    cells.add(cellToString(cell));
                }
                allRows.add(cells.toArray(new String[0]));
            }
        } catch (Exception e) {
            return new ImportResult(0, 0, List.of("Σφάλμα ανάγνωσης Excel: " + e.getMessage()));
        }
        if (allRows.isEmpty()) {
            return new ImportResult(0, 0, List.of("Το φύλλο Excel είναι κενό."));
        }
        String[] headers = allRows.get(0);
        for (int i = 0; i < headers.length; i++) {
            if (headers[i] != null) headers[i] = headers[i].trim();
        }
        return processImportRows(headers, allRows.subList(1, allRows.size()));
    }

    private static String cellToString(Cell cell) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.NUMERIC) {
            double n = cell.getNumericCellValue();
            if (n == (long) n) return String.valueOf((long) n);
            return String.valueOf(n);
        }
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue();
        if (cell.getCellType() == CellType.BOOLEAN) return String.valueOf(cell.getBooleanCellValue());
        return "";
    }

    /**
     * Κοινή επεξεργασία γραμμών εισαγωγής (CSV ή Excel). Headers: sku, name, category, barcode, unit, description, manufacturerTerm, localSlang, price, location, dimensions, colorRal, packagingInfo, stock, minStock.
     */
    private ImportResult processImportRows(String[] headers, List<String[]> dataRows) {
        int skuIdx = indexOf(headers, "sku");
        int nameIdx = indexOf(headers, "name");
        if (skuIdx < 0 || nameIdx < 0) {
            return new ImportResult(0, 0, List.of("Απαιτούνται στήλες 'sku' και 'name' στην επικεφαλίδα."));
        }
        int catIdx = indexOf(headers, "category");
        int barcodeIdx = indexOf(headers, "barcode");
        int unitIdx = indexOf(headers, "unit");
        int descIdx = indexOf(headers, "description");
        int mfrIdx = indexOf(headers, "manufacturerTerm");
        int slangIdx = indexOf(headers, "localSlang");
        int priceIdx = indexOf(headers, "price");
        int locIdx = indexOf(headers, "location");
        int dimIdx = indexOf(headers, "dimensions");
        int ralIdx = indexOf(headers, "colorRal");
        int packIdx = indexOf(headers, "packagingInfo");
        int qrCodeIdx = indexOf(headers, "qrCode");
        int supplierIdx = indexOf(headers, "supplier");
        int internalNotesIdx = indexOf(headers, "internalNotes");
        int stockIdx = indexOf(headers, "stock");
        int minIdx = indexOf(headers, "minStock");

        int created = 0, updated = 0;
        List<String> errors = new ArrayList<>();
        for (int i = 0; i < dataRows.size(); i++) {
            String[] cells = dataRows.get(i);
            int rowNum = i + 2;
            String sku = getCell(cells, skuIdx);
            String name = getCell(cells, nameIdx);
            if (sku == null || sku.isBlank() || name == null || name.isBlank()) {
                errors.add("Γραμμή " + rowNum + ": απαιτούνται sku και name");
                continue;
            }
            try {
                Optional<Product> existing = repo.findBySku(sku.trim());
                if (existing.isPresent()) {
                    Product p = existing.get();
                    if (catIdx >= 0) p.setCategory(blankToNull(getCell(cells, catIdx)));
                    if (barcodeIdx >= 0) p.setBarcode(blankToNull(getCell(cells, barcodeIdx)));
                    if (qrCodeIdx >= 0) p.setQrCode(blankToNull(getCell(cells, qrCodeIdx)));
                    if (unitIdx >= 0 && getCell(cells, unitIdx) != null && !getCell(cells, unitIdx).isBlank()) p.setUnit(getCell(cells, unitIdx).trim());
                    if (descIdx >= 0) p.setDescription(blankToNull(getCell(cells, descIdx)));
                    if (mfrIdx >= 0) p.setManufacturerTerm(blankToNull(getCell(cells, mfrIdx)));
                    if (slangIdx >= 0) p.setLocalSlang(blankToNull(getCell(cells, slangIdx)));
                    if (priceIdx >= 0) {
                        String v = getCell(cells, priceIdx);
                        if (v != null && !v.isBlank()) p.setPrice(new BigDecimal(v.trim().replace(',', '.')));
                    }
                    if (locIdx >= 0) p.setLocation(blankToNull(getCell(cells, locIdx)));
                    if (dimIdx >= 0) p.setDimensions(blankToNull(getCell(cells, dimIdx)));
                    if (ralIdx >= 0) p.setColorRal(blankToNull(getCell(cells, ralIdx)));
                    if (packIdx >= 0) p.setPackagingInfo(blankToNull(getCell(cells, packIdx)));
                    if (supplierIdx >= 0) p.setSupplier(blankToNull(getCell(cells, supplierIdx)));
                    if (internalNotesIdx >= 0) p.setInternalNotes(blankToNull(getCell(cells, internalNotesIdx)));
                    if (minIdx >= 0) {
                        String v = getCell(cells, minIdx);
                        if (v != null && !v.isBlank()) p.setMinStock(Integer.parseInt(v.trim()));
                    }
                    repo.save(p);
                    updated++;
                } else {
                    BigDecimal price = priceIdx >= 0 ? parseBigDecimal(getCell(cells, priceIdx)) : null;
                    int stock = stockIdx >= 0 ? parseInt(getCell(cells, stockIdx), 0) : 0;
                    int minStock = minIdx >= 0 ? parseInt(getCell(cells, minIdx), 0) : 0;
                    CreateProductRequest req = new CreateProductRequest(
                            sku.trim(), name.trim(),
                            catIdx >= 0 ? blankToNull(getCell(cells, catIdx)) : null,
                            barcodeIdx >= 0 ? blankToNull(getCell(cells, barcodeIdx)) : null,
                            qrCodeIdx >= 0 ? blankToNull(getCell(cells, qrCodeIdx)) : null,
                            unitIdx >= 0 && getCell(cells, unitIdx) != null && !getCell(cells, unitIdx).isBlank() ? getCell(cells, unitIdx).trim() : "τεμάχια",
                            descIdx >= 0 ? blankToNull(getCell(cells, descIdx)) : null,
                            mfrIdx >= 0 ? blankToNull(getCell(cells, mfrIdx)) : null,
                            slangIdx >= 0 ? blankToNull(getCell(cells, slangIdx)) : null,
                            price,
                            locIdx >= 0 ? blankToNull(getCell(cells, locIdx)) : null,
                            dimIdx >= 0 ? blankToNull(getCell(cells, dimIdx)) : null,
                            ralIdx >= 0 ? blankToNull(getCell(cells, ralIdx)) : null,
                            packIdx >= 0 ? blankToNull(getCell(cells, packIdx)) : null,
                            supplierIdx >= 0 ? blankToNull(getCell(cells, supplierIdx)) : null,
                            internalNotesIdx >= 0 ? blankToNull(getCell(cells, internalNotesIdx)) : null,
                            stock, minStock);
                    create(req);
                    created++;
                }
            } catch (Exception e) {
                errors.add("Γραμμή " + rowNum + ": " + e.getMessage());
            }
        }
        return new ImportResult(created, updated, errors);
    }

    private static String[] parseCsvLine(String line) {
        List<String> out = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') inQuotes = !inQuotes;
            else if ((c == ',' && !inQuotes) || c == ';') {
                out.add(cur.toString().trim());
                cur = new StringBuilder();
            } else cur.append(c);
        }
        out.add(cur.toString().trim());
        return out.toArray(new String[0]);
    }

    private static int indexOf(String[] arr, String key) {
        for (int i = 0; i < arr.length; i++)
            if (key.equalsIgnoreCase(arr[i].trim())) return i;
        return -1;
    }

    private static String getCell(String[] cells, int idx) {
        if (idx < 0 || idx >= cells.length) return null;
        String s = cells[idx];
        return s == null || s.isEmpty() ? null : s;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static BigDecimal parseBigDecimal(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return new BigDecimal(s.trim().replace(',', '.'));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static int parseInt(String s, int def) {
        if (s == null || s.isBlank()) return def;
        try {
            return Integer.parseInt(s.trim());
        } catch (NumberFormatException e) {
            return def;
        }
    }
}
