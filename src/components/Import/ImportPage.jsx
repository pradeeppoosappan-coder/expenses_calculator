import { useState } from 'react'
import { FileText, ImageIcon, Type, AlertCircle, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useDocumentParser } from '@/hooks/useDocumentParser'
import { useToast } from '@/components/ui/toast'
import PDFUploader from './PDFUploader'
import ImageUploader from './ImageUploader'
import TextInput from './TextInput'
import ReviewTable from './ReviewTable'

export default function ImportPage({ addMany, findDuplicate, onImported }) {
  const { toast } = useToast()
  const { loading, error, setError, reset, parseText, parsePdf, parseImage } =
    useDocumentParser()
  const [parsed, setParsed] = useState(null)
  const [lastAction, setLastAction] = useState(null)

  const runAndCapture = async (fn) => {
    setError(null)
    const items = await fn()
    if (items && items.length) {
      setParsed(items)
    }
  }

  const handlePdf = (file) => {
    setLastAction(() => () => parsePdf(file))
    runAndCapture(() => parsePdf(file))
  }
  const handleImage = (file) => {
    setLastAction(() => () => parseImage(file))
    runAndCapture(() => parseImage(file))
  }
  const handleText = (text) => {
    setLastAction(() => () => parseText(text))
    runAndCapture(() => parseText(text))
  }

  const handleConfirm = (items) => {
    const dupes = items.filter((it) =>
      findDuplicate(it.type, it),
    ).length
    const { incomes, expenses } = addMany(items)
    setParsed(null)
    reset()
    toast({
      variant: 'success',
      title: 'Imported successfully',
      description:
        `Added ${incomes} income and ${expenses} expense ${
          incomes + expenses === 1 ? 'item' : 'items'
        }.` + (dupes > 0 ? ` (${dupes} looked like possible duplicates)` : ''),
    })
    onImported?.()
  }

  const retry = () => {
    setError(null)
    if (lastAction) runAndCapture(lastAction)
  }

  if (parsed) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ReviewTable
            items={parsed}
            onConfirm={handleConfirm}
            onCancel={() => {
              setParsed(null)
              reset()
            }}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Import with AI</h2>
        <p className="text-sm text-muted-foreground">
          Upload a PDF, image or paste text — AI extracts the financial data for you to review.
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
          {lastAction && (
            <Button variant="outline" size="sm" onClick={retry}>
              <RotateCcw className="size-4" /> Retry
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Choose an input method</CardTitle>
          <CardDescription>All three methods produce an editable review table.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pdf">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
              <TabsTrigger value="pdf">
                <FileText className="size-4" /> PDF
              </TabsTrigger>
              <TabsTrigger value="image">
                <ImageIcon className="size-4" /> Image
              </TabsTrigger>
              <TabsTrigger value="text">
                <Type className="size-4" /> Text
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pdf">
              <PDFUploader onFile={handlePdf} loading={loading} onError={setError} />
            </TabsContent>
            <TabsContent value="image">
              <ImageUploader onFile={handleImage} loading={loading} onError={setError} />
            </TabsContent>
            <TabsContent value="text">
              <TextInput onText={handleText} loading={loading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
