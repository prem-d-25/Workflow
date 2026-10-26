import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface EmployeesPaginationProps {
  page: number
  total: number
  pageSize: number
  onPageChange: (newPage: number) => void
}

export const EmployeesPagination: React.FC<EmployeesPaginationProps> = ({
  page,
  total,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <div className="text-xs text-muted-foreground font-mono">
        Total {total} {total === 1 ? "employee" : "employees"}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          Previous
        </Button>

        <span className="text-xs text-muted-foreground px-2 font-mono">
          Page {page} of {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  )
}
