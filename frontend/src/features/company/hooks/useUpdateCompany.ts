import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateCompany } from "@/api/companyApi"
import { companyKeys } from "./queryKeys"
import type { CompanyUpdateRequest } from "../types"

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CompanyUpdateRequest) => updateCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.details() })
    },
  })
}
