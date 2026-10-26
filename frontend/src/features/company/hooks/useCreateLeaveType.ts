import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createLeaveType } from "@/api/leaveTypeApi"
import { companyKeys } from "./queryKeys"
import type { LeaveTypeCreateRequest } from "../types"

export function useCreateLeaveType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LeaveTypeCreateRequest) => createLeaveType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.leaveTypes() })
    },
  })
}
