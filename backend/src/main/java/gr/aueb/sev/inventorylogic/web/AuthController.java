package gr.aueb.sev.inventorylogic.web;

import gr.aueb.sev.inventorylogic.dto.LoginRequest;
import gr.aueb.sev.inventorylogic.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            String token = authService.login(req.username(), req.password());
            return ResponseEntity.ok(Map.of("token", token, "username", req.username()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Λάθος username ή password"));
        }
    }
}
