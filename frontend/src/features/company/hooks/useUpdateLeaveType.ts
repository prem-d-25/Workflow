import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateLeaveType } from "@/api/leaveTypeApi"
import { companyKeys } from "./queryKeys"
import type { LeaveTypeUpdateRequest } from "../types"

export function useUpdateLeaveType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeaveTypeUpdateRequest }) =>
      updateLeaveType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.leaveTypes() })
    },
  })
}
