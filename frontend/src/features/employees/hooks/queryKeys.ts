import type { UserListParams } from "../types"

export const employeeKeys = {
  all: ["employees"] as const,
  list: (params?: UserListParams) => [...employeeKeys.all, "list", params] as const,
  detail: (id: string) => [...employeeKeys.all, "detail", id] as const,
}
