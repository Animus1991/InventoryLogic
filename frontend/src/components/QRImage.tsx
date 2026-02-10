import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type Props = {
  value: string
  size?: number
  className?: string
}

export default function QRImage({ value, size = 80, className }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!value) return
    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then(setDataUrl)
      .catch(() => setDataUrl(null))
  }, [value, size])
  if (!dataUrl || !value) return <span className="inline-block h-4 w-4 bg-slate-200" aria-hidden />
  return <img src={dataUrl} alt="" width={size} height={size} className={className} />
}
