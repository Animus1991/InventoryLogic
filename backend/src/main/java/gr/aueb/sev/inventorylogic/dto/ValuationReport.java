package gr.aueb.sev.inventorylogic.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Αναφορά αποτίμησης αποθέματος: λίστα προϊόντων με αξία και συνολική αξία.
 */
public record ValuationReport(
        List<ValuationItem> items,
        BigDecimal totalValue
) {}
