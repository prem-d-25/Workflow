import React from "react"
import { PageHeader } from "@/components/common/PageHeader"
import { CompanyDetailsForm } from "@/features/company/components/CompanyDetailsForm"
import { LeaveTypesPanel } from "@/features/company/components/LeaveTypesPanel"

export const CompanyPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Company"
        description="Manage company details and configure organizational leave types."
      />
      <div className="space-y-6">
        <CompanyDetailsForm />
        <LeaveTypesPanel />
      </div>
    </div>
  )
}
