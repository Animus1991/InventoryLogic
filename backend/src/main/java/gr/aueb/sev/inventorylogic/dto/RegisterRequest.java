package gr.aueb.sev.inventorylogic.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Email απαιτείται")
        @Email(message = "Μη έγκυρη διεύθυνση email")
        String email,

        @NotBlank(message = "Username απαιτείται")
        @Size(min = 2, max = 100, message = "Το username πρέπει να έχει από 2 έως 100 χαρακτήρες")
        String username,

        @NotBlank(message = "Password απαιτείται")
        @Size(min = 6, message = "Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες")
        String password
) {}
