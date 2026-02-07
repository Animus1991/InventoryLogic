package gr.aueb.sev.inventorylogic.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Username απαιτείται") String username,
        @NotBlank(message = "Password απαιτείται") String password
) {}
