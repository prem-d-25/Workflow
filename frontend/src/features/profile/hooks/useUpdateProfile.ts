import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "@/api/profileApi"
import { useAuthStore } from "@/store/authStore"
import { profileKeys } from "./queryKeys"
import type { ProfileUpdateRequest } from "../types"

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.updateUser)

  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) => updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(profileKeys.me(), updatedProfile)
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
      updateUser({ full_name: updatedProfile.full_name })
    },
  })
}
