import { useEffect, useRef, useState } from 'react'
import { ImageIcon, Upload, Loader2, ClipboardPaste } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MAX_FILE_SIZE } from '@/utils/constants'
import { cn } from '@/lib/utils'

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

export default function ImageUploader({ onFile, loading, onError }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFile = (file) => {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      onError?.('Please upload a PNG, JPG or WebP image.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      onError?.('File is larger than 10MB. Please upload a smaller file.')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    onFile(file)
  }

  // Clipboard paste support
  useEffect(() => {
    const onPaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            handleFile(file)
            e.preventDefault()
          }
          break
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
        dragging ? 'border-primary bg-primary/5' : 'border-border',
        loading && 'pointer-events-none opacity-70',
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFile(e.dataTransfer.files?.[0])
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {preview && (
        <img
          src={preview}
          alt="Upload preview"
          className="mb-2 max-h-40 rounded-lg border object-contain"
        />
      )}

      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {loading ? <Loader2 className="size-7 animate-spin" /> : <ImageIcon className="size-7" />}
      </span>

      {loading ? (
        <div>
          <p className="font-medium">Parsing image…</p>
          <p className="text-sm text-muted-foreground">Extracting financial data with AI</p>
        </div>
      ) : (
        <>
          <div>
            <p className="font-medium">Drop a screenshot, click to browse, or paste (Ctrl/Cmd+V)</p>
            <p className="text-sm text-muted-foreground">
              UPI notifications, SMS screenshots, receipts · PNG / JPG / WebP · Max 10MB
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => inputRef.current?.click()}>
              <Upload className="size-4" /> Choose image
            </Button>
            <Button variant="outline" disabled>
              <ClipboardPaste className="size-4" /> or paste anywhere
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
