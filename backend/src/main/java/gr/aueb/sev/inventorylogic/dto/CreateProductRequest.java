package gr.aueb.sev.inventorylogic.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record CreateProductRequest(
        @NotBlank String sku,
        @NotBlank String name,
        String category,
        String barcode,
        String unit,
        String description,
        BigDecimal price,
        String location,
        String dimensions,
        String colorRal,
        String packagingInfo,
        @Min(0) int stock,
        @Min(0) int minStock
) {}
