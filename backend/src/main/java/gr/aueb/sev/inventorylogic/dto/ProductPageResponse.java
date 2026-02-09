package gr.aueb.sev.inventorylogic.dto;

import gr.aueb.sev.inventorylogic.domain.Product;
import java.util.List;

public record ProductPageResponse(
        List<Product> items,
        long total,
        int page,
        int size
) {}
