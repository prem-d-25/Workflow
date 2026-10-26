import { useQuery } from "@tanstack/react-query"
import { getUser } from "@/api/userApi"
import { employeeKeys } from "./queryKeys"

export function useUser(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  })
}
