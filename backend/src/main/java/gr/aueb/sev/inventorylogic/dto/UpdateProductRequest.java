package gr.aueb.sev.inventorylogic.dto;

import jakarta.validation.constraints.Min;

/**
 * Μερική ενημέρωση προϊόντος (όσα πεδία στέλνονται αλλάζουν).
 */
public record UpdateProductRequest(
        String sku,
        String name,
        String category,
        @Min(0) Integer minStock
) {}
