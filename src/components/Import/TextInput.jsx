import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const EXAMPLE =
  'freelance payment 25000 from client X on June 15\nHDFC EMI 18500 monthly, outstanding 2800000, 180 months left at 8.5%\nRent 15000 per month'

export default function TextInput({ onText, loading }) {
  const [text, setText] = useState('')

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        disabled={loading}
        placeholder={`Paste bank SMS, UPI notifications, salary breakdown or informal notes…\n\nExample:\n${EXAMPLE}`}
        className="font-mono text-sm"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          The AI will extract every income and expense it can find.
        </p>
        <Button onClick={() => onText(text)} disabled={loading || !text.trim()}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Parsing…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Extract items
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
