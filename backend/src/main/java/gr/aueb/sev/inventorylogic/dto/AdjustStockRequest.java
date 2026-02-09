package gr.aueb.sev.inventorylogic.dto;

import jakarta.validation.constraints.NotNull;

public record AdjustStockRequest(
        @NotNull(message = "Η μεταβολή αποθέματος (delta) απαιτείται") Integer delta,
        String note,
        String reference
) {}
