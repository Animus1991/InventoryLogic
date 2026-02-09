package gr.aueb.sev.inventorylogic.dto;

import java.math.BigDecimal;

/**
 * Γραμμή αναφοράς αποτίμησης: ένα προϊόν με αξία (ποσότητα × τιμή).
 */
public record ValuationItem(
        long productId,
        String sku,
        String name,
        int stock,
        String unit,
        BigDecimal unitPrice,
        BigDecimal value
) {}
