import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteLeaveType } from "@/api/leaveTypeApi"
import { companyKeys } from "./queryKeys"

export function useDeleteLeaveType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLeaveType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.leaveTypes() })
    },
  })
}
