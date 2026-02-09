package gr.aueb.sev.inventorylogic.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email ή username απαιτείται") String emailOrUsername,
        @NotBlank(message = "Κωδικός απαιτείται") String password
) {}
