import { useQuery } from "@tanstack/react-query"
import { getProfile } from "@/api/profileApi"
import { profileKeys } from "./queryKeys"

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: getProfile,
  })
}
