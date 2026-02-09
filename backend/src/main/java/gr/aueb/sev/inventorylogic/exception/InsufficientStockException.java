package gr.aueb.sev.inventorylogic.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String sku, int requested, int available) {
        super("Ανεπαρκές απόθεμα για SKU " + sku + ". Ζητήθηκε " + requested + ", διαθέσιμο " + available + ".");
    }
}
