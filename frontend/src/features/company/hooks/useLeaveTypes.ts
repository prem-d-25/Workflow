import { useQuery } from "@tanstack/react-query"
import { getLeaveTypes } from "@/api/leaveTypeApi"
import { companyKeys } from "./queryKeys"

export function useLeaveTypes() {
  return useQuery({
    queryKey: companyKeys.leaveTypes(),
    queryFn: getLeaveTypes,
  })
}
