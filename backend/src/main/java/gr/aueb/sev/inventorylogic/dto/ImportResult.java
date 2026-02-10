package gr.aueb.sev.inventorylogic.dto;

import java.util.List;

/**
 * Αποτέλεσμα μαζικής εισαγωγής (CSV).
 */
public record ImportResult(
        int created,
        int updated,
        List<String> errors
) {}
