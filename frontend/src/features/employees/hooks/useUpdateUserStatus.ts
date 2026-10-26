import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUserStatus } from "@/api/userApi"
import { employeeKeys } from "./queryKeys"
import type { UserStatusUpdateRequest } from "../types"

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserStatusUpdateRequest }) =>
      updateUserStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) })
    },
  })
}
