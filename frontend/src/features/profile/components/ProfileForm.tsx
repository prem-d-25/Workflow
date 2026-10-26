import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { profileSchema, type ProfileFormData } from "../schemas"
import { useProfile } from "../hooks/useProfile"
import { useUpdateProfile } from "../hooks/useUpdateProfile"
import { ProfileSkeleton } from "./ProfileSkeleton"
import { ProfileAccountHeader } from "./ProfileAccountHeader"
import { ProfileFields } from "./ProfileFields"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/common/ErrorState"
import { getErrorMessage } from "@/lib/apiError"

export const ProfileForm: React.FC = () => {
  const { data: profile, isLoading, isError, error, refetch } = useProfile()
  const updateMutation = useUpdateProfile()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      full_name: "",
      phone: "",
      date_of_birth: "",
      address: "",
      designation: "",
      department: "",
      joined_on: "",
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
        address: profile.address || "",
        designation: profile.designation || "",
        department: profile.department || "",
        joined_on: profile.joined_on || "",
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setServerError(null)
    try {
      await updateMutation.mutateAsync({
        full_name: data.full_name,
        phone: data.phone || null,
        date_of_birth: data.date_of_birth || null,
        address: data.address || null,
        designation: data.designation || null,
        department: data.department || null,
        joined_on: data.joined_on || null,
      })
      toast.success("Profile updated")
      reset(data)
    } catch (err) {
      setServerError(getErrorMessage(err, "Failed to update profile"))
    }
  }

  if (isLoading) return <ProfileSkeleton />

  if (isError) {
    return (
      <div className="rounded-panel border border-border bg-surface p-6">
        <ErrorState
          message={getErrorMessage(error, "Failed to load profile.")}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const isSaving = isSubmitting || updateMutation.isPending

  return (
    <div className="rounded-panel border border-border bg-surface p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground">Personal information</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          View your account credentials and manage your employment details.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-control border border-danger/30 bg-danger-soft p-3 text-xs text-danger">
          {serverError}
        </div>
      )}

      <ProfileAccountHeader
        email={profile?.email}
        role={profile?.role}
        companyName={profile?.company_name}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl" noValidate>
        <ProfileFields register={register} errors={errors} />

        <div className="pt-2">
          <Button type="submit" size="sm" disabled={!isDirty || isSaving} className="min-w-[100px]">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </div>
  )
}
