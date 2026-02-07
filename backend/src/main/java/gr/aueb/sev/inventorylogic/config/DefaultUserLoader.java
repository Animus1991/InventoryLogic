package gr.aueb.sev.inventorylogic.config;

import gr.aueb.sev.inventorylogic.domain.User;
import gr.aueb.sev.inventorylogic.repo.UserRepo;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DefaultUserLoader {

    @Bean
    public ApplicationRunner createDefaultUser(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepo.count() == 0) {
                User admin = new User("admin", passwordEncoder.encode("admin"));
                userRepo.save(admin);
            }
        };
    }
}
