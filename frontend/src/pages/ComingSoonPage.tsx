import React from "react"
import { PageHeader } from "@/components/common/PageHeader"

interface ComingSoonPageProps {
  title: string
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title }) => {
  return (
    <div>
      <PageHeader
        title={title}
        description="This section is coming soon."
      />
    </div>
  )
}
