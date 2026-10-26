import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createUser } from "@/api/userApi"
import { employeeKeys } from "./queryKeys"
import type { CreateUserRequest } from "../types"

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    },
  })
}
