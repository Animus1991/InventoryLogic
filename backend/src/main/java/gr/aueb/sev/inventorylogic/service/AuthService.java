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

    public String login(String username, String password) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Λάθος username ή password"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Λάθος username ή password");
        }
        return jwtUtil.generateToken(user.getUsername());
    }
}
