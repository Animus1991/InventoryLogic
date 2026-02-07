package gr.aueb.sev.inventorylogic.dto;

import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

public record UpdateProductRequest(
        String sku,
        String name,
        String category,
        String barcode,
        String unit,
        String description,
        BigDecimal price,
        String location,
        String dimensions,
        String colorRal,
        String packagingInfo,
        @Min(0) Integer minStock
) {}
