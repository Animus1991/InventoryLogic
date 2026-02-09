package gr.aueb.sev.inventorylogic.dto;

import java.math.BigDecimal;

/**
 * Στατιστικά κεντρικής οθόνης (dashboard).
 */
public record DashboardStats(
        long productCount,
        long lowStockCount,
        BigDecimal totalValue,
        long recentMovementsCount
) {}
