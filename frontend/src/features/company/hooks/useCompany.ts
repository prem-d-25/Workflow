import { useQuery } from "@tanstack/react-query"
import { getCompany } from "@/api/companyApi"
import { companyKeys } from "./queryKeys"

export function useCompany() {
  return useQuery({
    queryKey: companyKeys.details(),
    queryFn: getCompany,
  })
}
