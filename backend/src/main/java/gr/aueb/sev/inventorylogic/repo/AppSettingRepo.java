package gr.aueb.sev.inventorylogic.repo;

import gr.aueb.sev.inventorylogic.domain.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppSettingRepo extends JpaRepository<AppSetting, Long> {

    Optional<AppSetting> findByKey(String key);
}
