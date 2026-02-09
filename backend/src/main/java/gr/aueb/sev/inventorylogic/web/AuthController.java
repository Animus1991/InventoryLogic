package gr.aueb.sev.inventorylogic.web;

import gr.aueb.sev.inventorylogic.domain.User;
import gr.aueb.sev.inventorylogic.dto.LoginRequest;
import gr.aueb.sev.inventorylogic.dto.RegisterRequest;
import gr.aueb.sev.inventorylogic.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            String token = authService.login(req.emailOrUsername(), req.password());
            User user = authService.findByEmailOrUsername(req.emailOrUsername().trim());
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "username", user.getUsername(),
                    "email", user.getEmail() != null ? user.getEmail() : ""
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            User user = authService.register(req.email(), req.username(), req.password());
            String token = authService.login(user.getEmail(), req.password());
            return ResponseEntity.status(201).body(Map.of(
                    "token", token,
                    "username", user.getUsername(),
                    "email", user.getEmail()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
