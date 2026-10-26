import React, { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const EmployeesFilters: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const currentSearch = searchParams.get("search") || ""
  const currentRole = searchParams.get("role") || "all"
  const currentStatus = searchParams.get("status") || "all"

  const [searchTerm, setSearchTerm] = useState(currentSearch)

  // Keep local search term in sync if URL changes externally
  useEffect(() => {
    setSearchTerm(currentSearch)
  }, [currentSearch])

  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          if (searchTerm.trim()) {
            next.set("search", searchTerm.trim())
          } else {
            next.delete("search")
          }
          next.set("page", "1")
          return next
        })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, currentSearch, setSearchParams])

  const handleRoleChange = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (val === "all") {
        next.delete("role")
      } else {
        next.set("role", val)
      }
      next.set("page", "1")
      return next
    })
  }

  const handleStatusChange = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (val === "all") {
        next.delete("status")
      } else {
        next.set("status", val)
      }
      next.set("page", "1")
      return next
    })
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9 h-9 text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select value={currentRole} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
