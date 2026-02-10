import { useEffect, useId, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

type Props = {
  onScan: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const containerId = useId().replace(/:/g, '') || 'barcode-scanner-root'
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan
  const [status, setStatus] = useState<'starting' | 'ready' | 'error'>('starting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const start = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras()
        if (!mounted) return
        if (!cameras || cameras.length === 0) {
          setStatus('error')
          setErrorMessage('Δεν βρέθηκε κάμερα. Χρησιμοποιήστε πληκτρολόγηση barcode.')
          return
        }
        const scanner = new Html5Qrcode(containerId)
        scannerRef.current = scanner
        await scanner.start(
          cameras[0].id,
          {
            fps: 10,
            qrbox: { width: 260, height: 200 },
          },
          (decodedText) => {
            scanner.stop()
              .then(() => {
                scannerRef.current = null
                onScanRef.current(decodedText)
              })
              .catch(() => onScanRef.current(decodedText))
          },
          () => { /* ignore scan errors (no code in frame) */ }
        )
        if (mounted) setStatus('ready')
      } catch (err) {
        if (!mounted) return
        setStatus('error')
        const msg = err instanceof Error ? err.message : String(err)
        setErrorMessage(msg.includes('Permission') || msg.includes('NotAllowed')
          ? 'Η πρόσβαση στην κάμερα δεν επιτρέπεται. Ενεργοποιήστε την κάμερα στις ρυθμίσεις του browser.'
          : `Σφάλμα κάμερας: ${msg}`)
      }
    }
    start()
    return () => {
      mounted = false
      scannerRef.current?.stop()
        .then(() => scannerRef.current?.clear())
        .catch(() => {})
        .finally(() => { scannerRef.current = null })
    }
  }, [containerId])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-700 bg-slate-800 px-4 py-3 text-white">
        <h3 className="text-lg font-semibold">Σάρωση barcode</h3>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] rounded-lg bg-slate-600 px-4 py-2 font-medium hover:bg-slate-500"
        >
          Κλείσιμο
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-4">
        {status === 'error' && (
          <div className="w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <p className="font-medium">{errorMessage}</p>
            <p className="mt-2 text-sm">Μπορείτε να πληκτρολογήσετε το barcode στο πεδίο αναζήτησης.</p>
          </div>
        )}
        {status !== 'error' && (
          <div
            id={containerId}
            className="w-full max-w-md overflow-hidden rounded-lg bg-black [&>div]:!border-0 [&_video]:max-h-[70vh] [&_video]:w-full"
          />
        )}
        {status === 'starting' && !errorMessage && (
          <p className="mt-4 text-slate-300">Εκκίνηση κάμερας...</p>
        )}
      </div>
    </div>
  )
}
