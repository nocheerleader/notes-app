import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "./ui/button"

interface SummaryDialogProps {
  isOpen: boolean
  onClose: () => void
  summary: string | null
  isLoading: boolean
  error?: string
  onSave?: (summary: string) => void
}

export function SummaryDialog({ 
  isOpen, 
  onClose, 
  summary, 
  isLoading, 
  error,
  onSave 
}: SummaryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Note Summary</DialogTitle>
          <DialogDescription>
            AI-generated summary of your note
          </DialogDescription>
        </DialogHeader>
        
        <div className="min-h-[100px] p-4 rounded-lg bg-muted/50">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          )}
          
          {error && (
            <div className="text-destructive text-center">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {!isLoading && !error && summary && (
            <p className="text-foreground leading-relaxed">
              {summary}
            </p>
          )}
        </div>

        {/* Add save button section */}
        {!isLoading && !error && summary && onSave && (
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => onSave(summary)}
              className="w-full sm:w-auto"
            >
              Save Summary
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}