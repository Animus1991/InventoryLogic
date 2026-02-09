package gr.aueb.sev.inventorylogic.exception;

public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(Long id) {
        super("Δεν βρέθηκε προϊόν με id: " + id);
    }
}
