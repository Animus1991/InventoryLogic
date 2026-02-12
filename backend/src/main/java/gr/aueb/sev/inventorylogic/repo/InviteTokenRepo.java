package gr.aueb.sev.inventorylogic.repo;

import gr.aueb.sev.inventorylogic.domain.InviteToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface InviteTokenRepo extends JpaRepository<InviteToken, Long> {

    Optional<InviteToken> findByTokenAndUsedFalseAndExpiresAtAfter(String token, Instant now);
}
