import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

type Props = {
  value: string
  format?: string
  width?: number
  height?: number
  className?: string
}

export default function BarcodeImage({ value, format = 'CODE128', width = 2, height = 60, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!canvasRef.current || !value) return
    try {
      JsBarcode(canvasRef.current, value, { format, width, height })
    } catch {
      // fallback: show value as text if barcode fails
    }
  }, [value, format, width, height])
  if (!value) return <span className="text-slate-400">—</span>
  return <canvas ref={canvasRef} className={className} />
}
