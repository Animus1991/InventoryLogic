package gr.aueb.sev.inventorylogic.web;

import gr.aueb.sev.inventorylogic.exception.InsufficientStockException;
import gr.aueb.sev.inventorylogic.exception.ProductNotFoundException;
import gr.aueb.sev.inventorylogic.exception.SkuAlreadyExistsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Σφάλματα επικύρωσης ( validation ) από @Valid – επιστροφή σαφούς μηνύματος. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining("; "));
        if (message.isEmpty()) {
            message = "Μη έγκυρα δεδομένα.";
        } else {
            message = "Επικύρωση: " + message;
        }
        log.warn("Validation failed: {}", message);
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    /** Λογικά σφάλματα (π.χ. διπλότυπο email, λάθος credentials). */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler({SkuAlreadyExistsException.class})
    public ResponseEntity<Map<String, String>> handleSku(SkuAlreadyExistsException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler({ProductNotFoundException.class})
    public ResponseEntity<Map<String, String>> handleNotFound(ProductNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler({InsufficientStockException.class})
    public ResponseEntity<Map<String, String>> handleInsufficient(InsufficientStockException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    /** Μη υποστηριζόμενη HTTP μέθοδος (π.χ. GET σε endpoint που δέχεται μόνο POST). */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, String>> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        String method = ex.getMethod() != null ? ex.getMethod() : "?";
        log.warn("Method not allowed: {} for this endpoint", method);
        String message = "Η μέθοδος «" + method + "» δεν υποστηρίζεται για αυτό το endpoint.";
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(Map.of("message", message));
    }

    /** Γενικό σφάλμα – πάντα επιστρέφουμε JSON με "message". */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleOther(Exception ex) {
        log.error("Server error", ex);
        String message = ex.getMessage() != null ? ex.getMessage() : "Σφάλμα διακομιστή. Δοκιμάστε ξανά ή επικοινωνήστε με το διαχειριστή.";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", message));
    }
}
