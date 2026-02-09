package gr.aueb.sev.inventorylogic.repo;

import gr.aueb.sev.inventorylogic.domain.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface StockMovementRepo extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByProductIdOrderByCreatedAtDesc(Long productId);

    /** Πλήθος κινήσεων μετά από συγκεκριμένη στιγμή (π.χ. τελευταίες 7 ημέρες). */
    long countByCreatedAtAfter(Instant since);
}
