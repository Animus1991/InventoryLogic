import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">Σχετικά με την εφαρμογή</h2>
      <p className="mb-3 text-slate-600">
        <strong>InventoryLogic</strong> είναι φοιτητική εργασία για τη διαχείριση αποθήκης αλουμινίου/σιδήρας
        (πορτοπαράθυρα, καγγελόπορτες, εξαρτήματα).
      </p>
      <p className="mb-3 text-slate-600">
        Τεχνολογίες: Java Spring Boot (REST API), React (Vite), Tailwind CSS, MySQL. Τεκμηρίωση API με Swagger.
      </p>
      <ul className="list-inside list-disc text-sm text-slate-600">
        <li>Διαχείριση προϊόντων (SKU, τιμή, θέση, διαστάσεις, RAL, συσκευασία)</li>
        <li>Κινήσεις αποθέματος με σημείωση και αναφορά τιμολογίου</li>
        <li>Audit log για όλες τις αλλαγές</li>
        <li>Αναζήτηση, φίλτρα, barcode, export CSV/PDF</li>
        <li>Σελίδα «Τι να παραγγείλω» και ξεχωριστή καρτέλα προϊόντος</li>
      </ul>
      <p className="mt-4">
        <Link to="/" className="text-blue-600 hover:underline">← Επιστροφή στην αρχική</Link>
      </p>
    </div>
  )
}
