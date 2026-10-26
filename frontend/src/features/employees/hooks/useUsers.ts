import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/api/userApi"
import { employeeKeys } from "./queryKeys"
import type { UserListParams } from "../types"

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => getUsers(params),
  })
}
