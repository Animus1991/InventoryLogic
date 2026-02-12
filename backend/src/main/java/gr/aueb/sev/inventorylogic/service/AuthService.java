package gr.aueb.sev.inventorylogic.service;

import gr.aueb.sev.inventorylogic.domain.InviteToken;
import gr.aueb.sev.inventorylogic.domain.User;
import gr.aueb.sev.inventorylogic.repo.AppSettingRepo;
import gr.aueb.sev.inventorylogic.repo.InviteTokenRepo;
import gr.aueb.sev.inventorylogic.repo.UserRepo;
import gr.aueb.sev.inventorylogic.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    public static final String SETTING_INVITE_ONLY = "invite_only";

    private final UserRepo userRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AppSettingRepo appSettingRepo;
    private final InviteTokenRepo inviteTokenRepo;

    public AuthService(UserRepo userRepo, JwtUtil jwtUtil, PasswordEncoder passwordEncoder,
                       AppSettingRepo appSettingRepo, InviteTokenRepo inviteTokenRepo) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.appSettingRepo = appSettingRepo;
        this.inviteTokenRepo = inviteTokenRepo;
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

    @Transactional
    public User register(String email, String username, String password, String inviteToken) {
        email = email.trim().toLowerCase();
        username = username.trim();
        if (isInviteOnly()) {
            if (inviteToken == null || inviteToken.isBlank()) {
                throw new IllegalArgumentException("Η εγγραφή επιτρέπεται μόνο με πρόσκληση. Ζητήστε σύνδεσμο πρόσκλησης από τον διαχειριστή.");
            }
            InviteToken token = inviteTokenRepo.findByTokenAndUsedFalseAndExpiresAtAfter(
                    inviteToken.trim(), java.time.Instant.now()).orElseThrow(() ->
                    new IllegalArgumentException("Μη έγκυρη ή ληγμένη πρόσκληση. Ζητήστε νέο σύνδεσμο από τον διαχειριστή."));
            token.setUsed(true);
            inviteTokenRepo.save(token);
        }
        if (userRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("Η διεύθυνση email χρησιμοποιείται ήδη");
        }
        if (userRepo.existsByUsername(username)) {
            throw new IllegalArgumentException("Το username χρησιμοποιείται ήδη");
        }
        User user = new User(email, username, passwordEncoder.encode(password));
        return userRepo.save(user);
    }

    public boolean isInviteOnly() {
        return appSettingRepo.findByKey(SETTING_INVITE_ONLY)
                .map(s -> "true".equalsIgnoreCase(s.getValue()))
                .orElse(false);
    }

    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("Χρήστης δεν βρέθηκε"));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Ο τρέχων κωδικός είναι λάθος");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }
}
