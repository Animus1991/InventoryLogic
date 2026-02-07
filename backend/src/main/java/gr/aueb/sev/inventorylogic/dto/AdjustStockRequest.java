package gr.aueb.sev.inventorylogic.dto;

import jakarta.validation.constraints.NotNull;

public record AdjustStockRequest(
        @NotNull Integer delta,
        String note
) {}
