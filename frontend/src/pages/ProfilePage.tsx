import React from "react"
import { PageHeader } from "@/components/common/PageHeader"
import { ProfileForm } from "@/features/profile/components/ProfileForm"

export const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="View your credentials and manage your personal and employment details."
      />
      <ProfileForm />
    </div>
  )
}
