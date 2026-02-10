package gr.aueb.sev.inventorylogic.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 64)
    private String sku;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 120)
    private String category;

    @Column(length = 64)
    private String barcode;

    /** Προαιρετικό περιεχόμενο QR (URL ή κείμενο). Αν null, το frontend μπορεί να παράγει QR από SKU/URL προϊόντος. */
    @Column(name = "qr_code", length = 512)
    private String qrCode;

    @Column(length = 32)
    private String unit = "τεμάχια";

    @Column(length = 500)
    private String description;

    /** Τεχνική ορολογία εταιρίας παραγωγής / διεθνής ορολογία. */
    @Column(name = "manufacturer_term", length = 255)
    private String manufacturerTerm;

    /** Αργκό μαστόρων / πωλητών τοπικά. */
    @Column(name = "local_slang", length = 255)
    private String localSlang;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(length = 64)
    private String location;

    @Column(length = 64)
    private String dimensions;

    @Column(length = 32)
    private String colorRal;

    @Column(length = 120)
    private String packagingInfo;

    @Column(nullable = false)
    private int stock = 0;

    @Column(name = "min_stock", nullable = false)
    private int minStock = 0;

    /** Προμηθευτής / προμηθευτές (όνομα ή κωδικός). */
    @Column(length = 255)
    private String supplier;

    /** Εσωτερικές σημειώσεις (όχι για πελάτες). */
    @Column(name = "internal_notes", length = 500)
    private String internalNotes;

    public Product() {}

    public Long getId() { return id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getManufacturerTerm() { return manufacturerTerm; }
    public void setManufacturerTerm(String manufacturerTerm) { this.manufacturerTerm = manufacturerTerm; }

    public String getLocalSlang() { return localSlang; }
    public void setLocalSlang(String localSlang) { this.localSlang = localSlang; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public int getMinStock() { return minStock; }
    public void setMinStock(int minStock) { this.minStock = minStock; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }
    public String getColorRal() { return colorRal; }
    public void setColorRal(String colorRal) { this.colorRal = colorRal; }
    public String getPackagingInfo() { return packagingInfo; }
    public void setPackagingInfo(String packagingInfo) { this.packagingInfo = packagingInfo; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getInternalNotes() { return internalNotes; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }
}
