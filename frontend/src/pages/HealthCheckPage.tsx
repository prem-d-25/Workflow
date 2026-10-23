import * as React from "react"
import { getHealth, type HealthStatus } from "@/api/healthApi"
import { PageHeader } from "@/components/common/PageHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"

export const HealthCheckPage: React.FC = () => {
  const [health, setHealth] = React.useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchHealth = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getHealth()
      setHealth(data)
    } catch {
      setError("Failed to connect to the backend API.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1080px]">
        <PageHeader
          title="System health"
          description="Verifies the connection between frontend, backend, and PostgreSQL database."
          action={
            <Button
              variant="primary"
              isLoading={isLoading}
              onClick={fetchHealth}
            >
              Check again
            </Button>
          }
        />

        {isLoading && (
          <div className="rounded-panel border border-border bg-surface p-6">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-4 space-y-3">
              <div className="h-6 w-full animate-pulse rounded bg-muted" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-panel border border-border bg-surface p-6 text-left">
            <h2 className="text-base font-medium text-foreground">Service unavailable</h2>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <div className="mt-4">
              <Button variant="secondary" onClick={fetchHealth}>
                Try again
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && health && (
          <div className="rounded-panel border border-border bg-surface p-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-base font-medium text-foreground">Connection status</h2>
              <p className="text-sm text-muted-foreground">
                All core setup services are running and accessible.
              </p>
            </div>

            <div className="mt-4 divide-y divide-border">
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">Backend API</span>
                <StatusBadge
                  status={health.status === "ok" ? "Active" : "Degraded"}
                  variant={health.status === "ok" ? "active" : "pending"}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">PostgreSQL database</span>
                <StatusBadge
                  status={health.database === "connected" ? "Connected" : "Disconnected"}
                  variant={health.database === "connected" ? "active" : "rejected"}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">Vector extension</span>
                <StatusBadge
                  status={health.vector === "enabled" ? "Enabled" : "Missing"}
                  variant={health.vector === "enabled" ? "active" : "rejected"}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
