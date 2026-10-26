import React from "react"

export interface ProfileAccountHeaderProps {
  email?: string
  role?: string
  companyName?: string
}

export const ProfileAccountHeader: React.FC<ProfileAccountHeaderProps> = ({
  email,
  role,
  companyName,
}) => {
  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-control border border-border bg-muted/40 p-4">
      <div>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Email address
        </span>
        <p className="text-xs font-mono font-medium text-foreground mt-0.5">{email}</p>
      </div>
      <div>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Role
        </span>
        <p className="text-xs font-semibold text-foreground capitalize mt-0.5">{role}</p>
      </div>
      <div>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Company
        </span>
        <p className="text-xs font-medium text-foreground mt-0.5">{companyName}</p>
      </div>
    </div>
  )
}
