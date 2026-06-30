import { useRef, useState } from 'react'
import { FileText, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MAX_FILE_SIZE } from '@/utils/constants'
import { cn } from '@/lib/utils'

export default function PDFUploader({ onFile, loading, onError }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState(null)

  const handleFile = (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      onError?.('Please upload a PDF file.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      onError?.('File is larger than 10MB. Please upload a smaller file.')
      return
    }
    setFileName(file.name)
    onFile(file)
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
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
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {loading ? <Loader2 className="size-7 animate-spin" /> : <FileText className="size-7" />}
      </span>
      {loading ? (
        <div>
          <p className="font-medium">Parsing {fileName}…</p>
          <p className="text-sm text-muted-foreground">Extracting financial data with AI</p>
        </div>
      ) : (
        <>
          <div>
            <p className="font-medium">Drop a PDF here, or click to browse</p>
            <p className="text-sm text-muted-foreground">
              Salary slips, bank or loan statements · Max 10MB
            </p>
          </div>
          <Button onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" /> Choose PDF
          </Button>
        </>
      )}
    </div>
  )
}
