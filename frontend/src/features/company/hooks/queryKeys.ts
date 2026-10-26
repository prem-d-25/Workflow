export const companyKeys = {
  all: ["company"] as const,
  details: () => [...companyKeys.all, "details"] as const,
  leaveTypes: () => [...companyKeys.all, "leaveTypes"] as const,
}
