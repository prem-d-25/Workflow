import React, { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface TemporaryPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  password: string
}

export const TemporaryPasswordDialog: React.FC<TemporaryPasswordDialogProps> = ({
  open,
  onOpenChange,
  email,
  password,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      toast.success("Password copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy password")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-panel border-border bg-surface p-6 shadow-float">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-base font-semibold text-foreground">
            Temporary password
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Account created for <span className="font-medium text-foreground">{email}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between rounded-control border border-border bg-muted/50 p-3">
            <span className="font-mono text-sm font-semibold tracking-wider text-foreground">
              {password}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 gap-1.5 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            This password is shown only once. Share it with the employee. They must change it at first login.
          </p>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" size="sm" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
