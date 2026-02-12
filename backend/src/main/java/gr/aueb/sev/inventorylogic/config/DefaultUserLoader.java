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

    /**
     * If you use your own admin account (recommended for production):
     * 1. Register first in the app with your real email.
     * 2. Create or edit <code>application-local.properties</code> in this project's
     *    src/main/resources/ (this file must be in .gitignore and must NOT be committed).
     * 3. Add: <code>admin.email=your@real.email</code>
     * 4. Restart the backend. The user with that email will be granted admin role.
     * If admin.email is not set, the default user from admin.user/admin.username/admin.password is created/updated.
     */
    @Bean
    public ApplicationRunner createDefaultUser(UserRepo userRepo, PasswordEncoder passwordEncoder, Environment env) {
        return args -> {
            String adminEmail = env.getProperty("admin.email");
            if (adminEmail != null && !adminEmail.isBlank()) {
                userRepo.findByEmail(adminEmail.trim().toLowerCase()).ifPresent(u -> {
                    u.setAdmin(true);
                    userRepo.save(u);
                });
                return;
            }
            String email = env.getProperty("admin.user", DEFAULT_EMAIL);
            String username = env.getProperty("admin.username", DEFAULT_USERNAME);
            String password = env.getProperty("admin.password", DEFAULT_PASSWORD);

            Optional<User> existing = userRepo.findByEmail(email);
            if (existing.isEmpty()) {
                User adminUser = new User(email, username, passwordEncoder.encode(password));
                adminUser.setAdmin(true);
                userRepo.save(adminUser);
            } else {
                User adminUser = existing.get();
                if (!passwordEncoder.matches(password, adminUser.getPasswordHash())) {
                    adminUser.setPasswordHash(passwordEncoder.encode(password));
                }
                adminUser.setAdmin(true);
                userRepo.save(adminUser);
            }
        };
    }
}
