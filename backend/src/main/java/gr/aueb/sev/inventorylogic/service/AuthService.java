package gr.aueb.sev.inventorylogic.service;

import gr.aueb.sev.inventorylogic.domain.User;
import gr.aueb.sev.inventorylogic.repo.UserRepo;
import gr.aueb.sev.inventorylogic.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepo userRepo, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    /** Login with email or username. */
    public String login(String emailOrUsername, String password) {
        boolean isEmail = emailOrUsername.contains("@");
        User user = isEmail
                ? userRepo.findByEmail(emailOrUsername.trim()).orElseThrow(() -> new IllegalArgumentException("Λάθος email ή κωδικός"))
                : userRepo.findByUsername(emailOrUsername.trim()).orElseThrow(() -> new IllegalArgumentException("Λάθος username ή κωδικός"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Λάθος email/username ή κωδικός");
        }
        return jwtUtil.generateToken(user.getUsername());
    }

    public User findByEmailOrUsername(String emailOrUsername) {
        return emailOrUsername.contains("@")
                ? userRepo.findByEmail(emailOrUsername.trim().toLowerCase()).orElseThrow()
                : userRepo.findByUsername(emailOrUsername.trim()).orElseThrow();
    }

    public User register(String email, String username, String password) {
        email = email.trim().toLowerCase();
        username = username.trim();
        if (userRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("Η διεύθυνση email χρησιμοποιείται ήδη");
        }
        if (userRepo.existsByUsername(username)) {
            throw new IllegalArgumentException("Το username χρησιμοποιείται ήδη");
        }
        User user = new User(email, username, passwordEncoder.encode(password));
        return userRepo.save(user);
    }
}
