import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Shield } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'

export function SectionPlaceholderView({
  title,
  description,
  icon: Icon,
  phase,
  features = [],
}) {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-800/90 via-slate-800/70 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/30 flex-shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                <Clock className="w-3 h-3" />
                <span>Phase {phase} Module</span>
              </div>
              <h1 className="text-2xl font-black text-white">{title}</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {description}
              </p>
            </div>
          </div>

          <Link to="/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Overview
            </Button>
          </Link>
        </div>
      </div>

      {/* Module Roadmap & Planned Capabilities */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-400" />
              <span>Role Permissions &amp; Planned Features</span>
            </h3>
            <Badge variant={user?.role || 'EMPLOYEE'} size="sm">
              Current Role: {user?.role}
            </Badge>
          </div>
        }
      >
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          This domain is wired into the navigation shell and secured with role-based routing.
        </p>

        {features.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Features:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {features.map((feat, idx) => (
                <li
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-3 border-t border-slate-700/60 flex items-center gap-3">
          <Button
            variant="teal"
            size="xs"
            onClick={() => toast.info(`Phase ${phase} is next on the development roadmap.`)}
          >
            Check Roadmap Status
          </Button>
          <Link to="/ui-catalog">
            <Button variant="ghost" size="xs">
              View UI Catalog
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
