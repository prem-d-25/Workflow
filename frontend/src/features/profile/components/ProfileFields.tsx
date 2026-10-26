import React from "react"
import type { UseFormRegister, FieldErrors } from "react-hook-form"
import type { ProfileFormData } from "../schemas"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface ProfileFieldsProps {
  register: UseFormRegister<ProfileFormData>
  errors: FieldErrors<ProfileFormData>
}

export const ProfileFields: React.FC<ProfileFieldsProps> = ({ register, errors }) => {
  return (
    <>
      <div>
        <Label htmlFor="profile-full-name" className="text-xs font-medium text-foreground">
          Full name *
        </Label>
        <Input
          id="profile-full-name"
          {...register("full_name")}
          hasError={Boolean(errors.full_name)}
          placeholder="e.g. Alex Morgan"
          className="mt-1"
        />
        {errors.full_name && (
          <p className="mt-1 text-[13px] text-danger">{errors.full_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="profile-phone" className="text-xs font-medium text-foreground">
            Phone number
          </Label>
          <Input
            id="profile-phone"
            {...register("phone")}
            hasError={Boolean(errors.phone)}
            placeholder="+1 (555) 000-0000"
            className="mt-1"
          />
          {errors.phone && <p className="mt-1 text-[13px] text-danger">{errors.phone.message}</p>}
        </div>

        <div>
          <Label htmlFor="profile-dob" className="text-xs font-medium text-foreground">
            Date of birth
          </Label>
          <Input
            id="profile-dob"
            type="date"
            {...register("date_of_birth")}
            hasError={Boolean(errors.date_of_birth)}
            className="mt-1"
          />
          {errors.date_of_birth && (
            <p className="mt-1 text-[13px] text-danger">{errors.date_of_birth.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="profile-designation" className="text-xs font-medium text-foreground">
            Designation
          </Label>
          <Input
            id="profile-designation"
            {...register("designation")}
            hasError={Boolean(errors.designation)}
            placeholder="e.g. Senior Software Engineer"
            className="mt-1"
          />
          {errors.designation && (
            <p className="mt-1 text-[13px] text-danger">{errors.designation.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="profile-department" className="text-xs font-medium text-foreground">
            Department
          </Label>
          <Input
            id="profile-department"
            {...register("department")}
            hasError={Boolean(errors.department)}
            placeholder="e.g. Engineering"
            className="mt-1"
          />
          {errors.department && (
            <p className="mt-1 text-[13px] text-danger">{errors.department.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="profile-joined-on" className="text-xs font-medium text-foreground">
          Joined on
        </Label>
        <Input
          id="profile-joined-on"
          type="date"
          {...register("joined_on")}
          hasError={Boolean(errors.joined_on)}
          className="mt-1"
        />
        {errors.joined_on && (
          <p className="mt-1 text-[13px] text-danger">{errors.joined_on.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="profile-address" className="text-xs font-medium text-foreground">
          Address
        </Label>
        <Input
          id="profile-address"
          {...register("address")}
          hasError={Boolean(errors.address)}
          placeholder="123 Main Street, City, Country"
          className="mt-1"
        />
        {errors.address && (
          <p className="mt-1 text-[13px] text-danger">{errors.address.message}</p>
        )}
      </div>
    </>
  )
}
