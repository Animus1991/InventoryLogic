package gr.aueb.sev.inventorylogic.config;

import gr.aueb.sev.inventorylogic.domain.User;
import gr.aueb.sev.inventorylogic.repo.UserRepo;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
public class DefaultUserLoader {

    private static final String DEFAULT_EMAIL = "admin@inventory.local";
    private static final String DEFAULT_USERNAME = "admin";
    private static final String DEFAULT_PASSWORD = "admin12";

    @Bean
    public ApplicationRunner createDefaultUser(UserRepo userRepo, PasswordEncoder passwordEncoder, Environment env) {
        return args -> {
            String email = env.getProperty("admin.user", DEFAULT_EMAIL);
            String username = env.getProperty("admin.username", DEFAULT_USERNAME);
            String password = env.getProperty("admin.password", DEFAULT_PASSWORD);

            Optional<User> existing = userRepo.findByEmail(email);
            if (existing.isEmpty()) {
                User admin = new User(email, username, passwordEncoder.encode(password));
                userRepo.save(admin);
            } else {
                User admin = existing.get();
                if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
                    admin.setPasswordHash(passwordEncoder.encode(password));
                    userRepo.save(admin);
                }
            }
        };
    }
}
