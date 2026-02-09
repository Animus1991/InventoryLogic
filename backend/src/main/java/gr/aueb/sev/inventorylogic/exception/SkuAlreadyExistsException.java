package gr.aueb.sev.inventorylogic.exception;

public class SkuAlreadyExistsException extends RuntimeException {
    public SkuAlreadyExistsException(String sku) {
        super("Το SKU «" + sku + "» υπάρχει ήδη. Επιλέξτε άλλο SKU.");
    }
}
