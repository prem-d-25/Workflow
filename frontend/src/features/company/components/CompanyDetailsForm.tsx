import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { companyDetailsSchema, type CompanyDetailsFormData } from "../schemas"
import { useCompany } from "../hooks/useCompany"
import { useUpdateCompany } from "../hooks/useUpdateCompany"
import { CompanyDetailsSkeleton } from "./CompanyDetailsSkeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorState } from "@/components/common/ErrorState"
import { getErrorMessage } from "@/lib/apiError"

export const CompanyDetailsForm: React.FC = () => {
  const { data: company, isLoading, isError, error, refetch } = useCompany()
  const updateMutation = useUpdateCompany()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CompanyDetailsFormData>({
    resolver: zodResolver(companyDetailsSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      website: "",
      industry: "",
      size: "",
    },
  })

  useEffect(() => {
    if (company) {
      reset({
        name: company.name || "",
        address: company.address || "",
        phone: company.phone || "",
        website: company.website || "",
        industry: company.industry || "",
        size: company.size || "",
      })
    }
  }, [company, reset])

  const onSubmit = async (data: CompanyDetailsFormData) => {
    setServerError(null)
    try {
      await updateMutation.mutateAsync({
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        website: data.website || null,
        industry: data.industry || null,
        size: data.size || null,
      })
      toast.success("Company details saved")
      reset(data)
    } catch (err) {
      setServerError(getErrorMessage(err, "Failed to save company details"))
    }
  }

  if (isLoading) return <CompanyDetailsSkeleton />

  if (isError) {
    return (
      <div className="rounded-panel border border-border bg-surface p-6">
        <ErrorState
          message={getErrorMessage(error, "Failed to load company details.")}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const isSaving = isSubmitting || updateMutation.isPending

  return (
    <div className="rounded-panel border border-border bg-surface p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground">General information</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Update your organization's legal name and contact details.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-control border border-danger/30 bg-danger-soft p-3 text-xs text-danger">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl" noValidate>
        <div>
          <Label htmlFor="company-name" className="text-xs font-medium text-foreground">
            Company name *
          </Label>
          <Input
            id="company-name"
            {...register("name")}
            hasError={Boolean(errors.name)}
            placeholder="e.g. Acme Corporation"
            className="mt-1"
          />
          {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company-industry" className="text-xs font-medium text-foreground">
              Industry
            </Label>
            <Input
              id="company-industry"
              {...register("industry")}
              hasError={Boolean(errors.industry)}
              placeholder="e.g. Technology"
              className="mt-1"
            />
            {errors.industry && <p className="mt-1 text-[13px] text-danger">{errors.industry.message}</p>}
          </div>

          <div>
            <Label htmlFor="company-size" className="text-xs font-medium text-foreground">
              Company size
            </Label>
            <Input
              id="company-size"
              {...register("size")}
              hasError={Boolean(errors.size)}
              placeholder="e.g. 1-10, 11-50, 50+"
              className="mt-1"
            />
            {errors.size && <p className="mt-1 text-[13px] text-danger">{errors.size.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company-website" className="text-xs font-medium text-foreground">
              Website
            </Label>
            <Input
              id="company-website"
              {...register("website")}
              hasError={Boolean(errors.website)}
              placeholder="https://example.com"
              className="mt-1"
            />
            {errors.website && <p className="mt-1 text-[13px] text-danger">{errors.website.message}</p>}
          </div>

          <div>
            <Label htmlFor="company-phone" className="text-xs font-medium text-foreground">
              Phone number
            </Label>
            <Input
              id="company-phone"
              {...register("phone")}
              hasError={Boolean(errors.phone)}
              placeholder="+1 (555) 000-0000"
              className="mt-1"
            />
            {errors.phone && <p className="mt-1 text-[13px] text-danger">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="company-address" className="text-xs font-medium text-foreground">
            Address
          </Label>
          <Input
            id="company-address"
            {...register("address")}
            hasError={Boolean(errors.address)}
            placeholder="123 Main Street, City, Country"
            className="mt-1"
          />
          {errors.address && <p className="mt-1 text-[13px] text-danger">{errors.address.message}</p>}
        </div>

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
