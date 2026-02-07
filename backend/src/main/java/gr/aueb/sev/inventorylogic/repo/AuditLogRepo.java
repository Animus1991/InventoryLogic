package gr.aueb.sev.inventorylogic.repo;

import gr.aueb.sev.inventorylogic.domain.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepo extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByProductIdOrderByCreatedAtDesc(Long productId);
}
