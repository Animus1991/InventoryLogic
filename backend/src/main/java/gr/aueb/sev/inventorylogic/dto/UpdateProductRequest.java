package gr.aueb.sev.inventorylogic.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateProductRequest(
        @Size(max = 64, message = "Το SKU δεν μπορεί να ξεπερνά τους 64 χαρακτήρες") String sku,
        @Size(max = 255, message = "Το όνομα δεν μπορεί να ξεπερνά τους 255 χαρακτήρες") String name,
        @Size(max = 120, message = "Η κατηγορία δεν μπορεί να ξεπερνά τους 120 χαρακτήρες") String category,
        @Size(max = 64, message = "Το barcode δεν μπορεί να ξεπερνά τους 64 χαρακτήρες") String barcode,
        @Size(max = 512, message = "Το QR code δεν μπορεί να ξεπερνά τους 512 χαρακτήρες") String qrCode,
        @Size(max = 32, message = "Η μονάδα μέτρησης δεν μπορεί να ξεπερνά τους 32 χαρακτήρες") String unit,
        @Size(max = 500, message = "Η περιγραφή δεν μπορεί να ξεπερνά τους 500 χαρακτήρες") String description,
        @Size(max = 255, message = "Η ορολογία παραγωγού δεν μπορεί να ξεπερνά τους 255 χαρακτήρες") String manufacturerTerm,
        @Size(max = 255, message = "Η τοπική ορολογία δεν μπορεί να ξεπερνά τους 255 χαρακτήρες") String localSlang,
        @PositiveOrZero(message = "Η τιμή δεν μπορεί να είναι αρνητική") BigDecimal price,
        @Size(max = 64, message = "Η τοποθεσία δεν μπορεί να ξεπερνά τους 64 χαρακτήρες") String location,
        @Size(max = 64, message = "Οι διαστάσεις δεν μπορούν να ξεπερνούν τους 64 χαρακτήρες") String dimensions,
        @Size(max = 32, message = "Το χρώμα RAL δεν μπορεί να ξεπερνά τους 32 χαρακτήρες") String colorRal,
        @Size(max = 120, message = "Η συσκευασία δεν μπορεί να ξεπερνά τους 120 χαρακτήρες") String packagingInfo,
        @Size(max = 255, message = "Ο προμηθευτής δεν μπορεί να ξεπερνά τους 255 χαρακτήρες") String supplier,
        @Size(max = 500, message = "Οι εσωτερικές σημειώσεις δεν μπορούν να ξεπερνούν τους 500 χαρακτήρες") String internalNotes,
        @Min(value = 0, message = "Το ελάχιστο απόθεμα δεν μπορεί να είναι αρνητικό") Integer minStock
) {}
