package gr.aueb.sev.inventorylogic.service;

import gr.aueb.sev.inventorylogic.domain.Product;
import gr.aueb.sev.inventorylogic.dto.DashboardStats;
import gr.aueb.sev.inventorylogic.dto.ValuationItem;
import gr.aueb.sev.inventorylogic.dto.ValuationReport;
import gr.aueb.sev.inventorylogic.repo.ProductRepo;
import gr.aueb.sev.inventorylogic.repo.StockMovementRepo;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.StreamSupport;

@Service
public class DashboardService {

    private static final int RECENT_DAYS = 7;

    private final ProductRepo productRepo;
    private final StockMovementRepo movementRepo;

    public DashboardService(ProductRepo productRepo, StockMovementRepo movementRepo) {
        this.productRepo = productRepo;
        this.movementRepo = movementRepo;
    }

    public DashboardStats getStats() {
        List<Product> all = productRepo.findAll();
        long productCount = all.size();
        long lowStockCount = all.stream()
                .filter(p -> p.getMinStock() > 0 && p.getStock() <= p.getMinStock())
                .count();
        BigDecimal totalValue = all.stream()
                .map(this::productValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Instant since = Instant.now().minus(RECENT_DAYS, ChronoUnit.DAYS);
        long recentMovementsCount = movementRepo.countByCreatedAtAfter(since);
        return new DashboardStats(productCount, lowStockCount, totalValue.setScale(2, RoundingMode.HALF_UP), recentMovementsCount);
    }

    public ValuationReport getValuationReport() {
        List<Product> all = productRepo.findAll();
        List<ValuationItem> items = all.stream()
                .map(p -> {
                    BigDecimal price = p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO;
                    BigDecimal value = price.multiply(BigDecimal.valueOf(p.getStock())).setScale(2, RoundingMode.HALF_UP);
                    return new ValuationItem(
                            p.getId(),
                            p.getSku() != null ? p.getSku() : "",
                            p.getName(),
                            p.getStock(),
                            p.getUnit() != null ? p.getUnit() : "τεμ.",
                            price.setScale(2, RoundingMode.HALF_UP),
                            value
                    );
                })
                .toList();
        BigDecimal totalValue = items.stream()
                .map(ValuationItem::value)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ValuationReport(items, totalValue);
    }

    private BigDecimal productValue(Product p) {
        if (p.getPrice() == null) return BigDecimal.ZERO;
        return p.getPrice().multiply(BigDecimal.valueOf(p.getStock()));
    }
}
