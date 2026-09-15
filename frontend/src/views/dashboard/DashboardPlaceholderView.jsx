import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Megaphone,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'
import { Badge, Button, Card, StatCard } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'

export function DashboardPlaceholderView() {
  const { user, company } = useAuthStore()

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-800/90 via-slate-800/70 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Phase 7.5 Navigation Shell Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome, {user?.full_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Enterprise workspace <strong className="text-white">{company?.name}</strong> is online.
              Your account is active under tenant boundary{' '}
              <code className="text-orange-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs">
                Company #{user?.company_id}
              </code>{' '}
              with <span className="font-semibold text-teal-400">{user?.role}</span> permissions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono space-y-1.5">
            <div className="text-slate-400">
              Corporate Email: <span className="text-white font-medium">{user?.email}</span>
            </div>
            <div className="text-slate-400">
              Tenant Quotas: <span className="text-teal-400 font-sans font-medium">Standard Default</span>
            </div>
            <div className="text-slate-400">
              Session Security:{' '}
              <span className="text-teal-400 font-sans font-semibold">🔒 HttpOnly Cookie</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Paid Leave Quota"
          value="15 Days"
          subtitle="Annual entitlement"
          trend="3 Used &bull; 12 Left"
          color="orange"
          icon={<CalendarCheck className="w-5 h-5" />}
        />
        <StatCard
          title="Team Directory"
          value="Active"
          subtitle="Tenant team members"
          trend="HR &bull; Employees"
          color="teal"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Announcements"
          value="Active"
          subtitle="Company broadcasts"
          trend="Live feed"
          color="indigo"
          icon={<Megaphone className="w-5 h-5" />}
        />
        <StatCard
          title="Policy AI Chatbot"
          value="Ready"
          subtitle="pgvector RAG + Groq"
          trend="384-dim Embeddings"
          color="emerald"
          icon={<Bot className="w-5 h-5" />}
        />
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card
          header={
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <CalendarCheck className="w-4 h-4 text-orange-400" />
              <span>Leave Management</span>
            </div>
          }
        >
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Apply for leave with real-time 5-day advance notice checks or review pending team submissions.
          </p>
          <Link to="/leaves">
            <Button variant="outline" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Leaves
            </Button>
          </Link>
        </Card>

        <Card
          header={
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Bot className="w-4 h-4 text-teal-400" />
              <span>AI Policy Assistant</span>
            </div>
          }
        >
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Ask natural language questions about leave policies, work-from-home rules, and guidelines.
          </p>
          <Link to="/policies">
            <Button variant="outline" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-teal-400" />}>
              Ask Policy AI
            </Button>
          </Link>
        </Card>

        <Card
          header={
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>Company Announcements</span>
            </div>
          }
        >
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Read latest company updates, HR memos, and operational notices broadcasted across the workspace.
          </p>
          <Link to="/announcements">
            <Button variant="outline" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-amber-400" />}>
              View Bulletin
            </Button>
          </Link>
        </Card>
      </div>

      {/* Phase Info Card */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Phase 7.5: Navigation Shell &amp; Responsive Layout</span>
            </h3>
            <span className="text-xs text-teal-400 font-semibold uppercase tracking-wider bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
              Completed
            </span>
          </div>
        }
      >
        <p className="text-sm text-slate-300 leading-relaxed">
          The main workspace layout is active with:
        </p>
        <ul className="mt-3 list-disc list-inside text-xs text-slate-400 space-y-1.5">
          <li>Responsive collapsible sidebar with role-filtered navigation items.</li>
          <li>Top header displaying tenant workspace, role pill badge, and user dropdown.</li>
          <li>In-modal user profile details and self-service password change.</li>
          <li>High-priority toast notification positioning (never hidden by navbars or dialogs).</li>
        </ul>
      </Card>
    </div>
  )
}
