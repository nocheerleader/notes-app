import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Props to receive the summary content and control dialog visibility
interface AISummaryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  summary: string
  onSave: () => void
}

export function AISummaryDialog({ 
  isOpen, 
  onOpenChange, 
  summary, 
  onSave 
}: AISummaryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Summary</DialogTitle>
          <DialogDescription>
            Here's the AI-generated summary of your content.
          </DialogDescription>
        </DialogHeader>
        
        {/* Display the summary */}
        <div className="mt-4 text-sm">
          {summary}
        </div>

        <DialogFooter className="mt-6">
          {/* Add the save button */}
          <Button onClick={onSave}>
            Save Summary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
