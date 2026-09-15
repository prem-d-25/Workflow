import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  Mail,
  Megaphone,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  FormField,
  Input,
  Modal,
  Select,
  Skeleton,
  Spinner,
  StatCard,
  TableSkeleton,
  Textarea,
} from '@/components/ui'
import {
  getPlannedMinDateString,
  getTodayString,
  leaveRequestSchema,
} from '@/lib/validations'
import { toast } from '@/store/toastStore'

export function ComponentCatalogView() {
  // Modal & Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // React Hook Form for Leave Application with Zod Validation
  const todayString = getTodayString()
  const leaveForm = useForm({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leave_type: 'PLANNED',
      start_date: '',
      end_date: '',
      reason: '',
    },
  })

  const watchLeaveType = leaveForm.watch('leave_type')
  const watchStartDate = leaveForm.watch('start_date')

  const minStartDate =
    watchLeaveType === 'PLANNED' ? getPlannedMinDateString(5) : todayString

  const onLeaveSubmit = (data) => {
    toast.success(
      `Leave request validated and submitted for ${data.start_date} to ${data.end_date}!`,
      'Validation Passed'
    )
    setIsModalOpen(false)
    leaveForm.reset()
  }

  // Form input test states
  const [demoInput, setDemoInput] = useState('')
  const [demoError, setDemoError] = useState('')
  const [demoSelect, setDemoSelect] = useState('PLANNED')
  const [demoTextarea, setDemoTextarea] = useState('')

  // Toggle button loading states
  const [btnLoading, setBtnLoading] = useState(false)

  const handleConfirmAction = () => {
    setIsActionLoading(true)
    setTimeout(() => {
      setIsActionLoading(false)
      setIsConfirmOpen(false)
      toast.success('Destructive action executed successfully!', 'Confirmed')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-700/80 bg-slate-800/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Workflow
                <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 font-medium">
                  UI Catalog
                </span>
              </span>
              <p className="text-xs text-slate-400 hidden sm:block">
                Production UI Component Library (Phase 7.3)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Register Workspace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-800/90 via-slate-800/70 to-slate-900 border border-slate-700 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Phase 7.3 Component Catalog</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Reusable Enterprise UI Components
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                All 12 foundational components are isolated under <code className="text-teal-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs">src/components/ui/</code>.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={() => toast.success('UI Component catalog verified and operating properly!')}
            >
              Test Global Toast
            </Button>
          </div>
        </div>

        {/* 1. Toast Notification Triggers */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>1. Toast Notifications System</span>
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-wrap gap-3 items-center">
            <Button
              variant="teal"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => toast.success('Operation completed successfully!', 'Leave Approved')}
            >
              Trigger Success Toast
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<AlertCircle className="w-4 h-4" />}
              onClick={() => toast.error('Planned leave must be requested at least 5 days in advance.', 'Validation Failed')}
            >
              Trigger Error Toast
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
              onClick={() => toast.warning('Quota exceeded. This leave will count as unpaid extra leave.', 'Quota Notice')}
            >
              Trigger Warning Toast
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={() => toast.info('New company announcement broadcasted by HR.', 'Announcement')}
            >
              Trigger Info Toast
            </Button>
          </div>
        </section>

        {/* 2. Buttons Showcase */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>2. Buttons &amp; Interactive Triggers</span>
            </h2>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setBtnLoading(!btnLoading)}
            >
              Toggle Loading State: {btnLoading ? 'ON' : 'OFF'}
            </Button>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" isLoading={btnLoading} leftIcon={<Sparkles className="w-4 h-4" />}>
                Primary (#FF4500)
              </Button>
              <Button variant="teal" isLoading={btnLoading} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Teal Accent (#0D9488)
              </Button>
              <Button variant="secondary" isLoading={btnLoading}>
                Secondary (Slate-800)
              </Button>
              <Button variant="outline" isLoading={btnLoading}>
                Outline Button
              </Button>
              <Button variant="danger" isLoading={btnLoading} leftIcon={<Trash2 className="w-4 h-4" />}>
                Danger (Rose-600)
              </Button>
              <Button variant="ghost" isLoading={btnLoading}>
                Ghost Action
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-3">
              <Button size="xs" variant="primary">Extra Small (xs)</Button>
              <Button size="sm" variant="teal">Small (sm)</Button>
              <Button size="md" variant="primary">Medium (md)</Button>
              <Button size="lg" variant="teal">Large (lg)</Button>
            </div>
          </div>
        </section>

        {/* 3. StatCards */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>3. StatCards (Dashboard Metrics)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Paid Leave Quota"
              value="15 Days"
              subtitle="3 days utilized this year"
              trend="12 Remaining"
              color="orange"
              icon={<CalendarCheck className="w-5 h-5" />}
            />
            <StatCard
              title="Team Members"
              value="28"
              subtitle="4 HR &bull; 23 Employees"
              trend="+3 this month"
              color="teal"
              icon={<Users className="w-5 h-5" />}
            />
            <StatCard
              title="Pending Approvals"
              value="5"
              subtitle="Requires manager review"
              trend="2 Urgent"
              color="indigo"
              icon={<Clock className="w-5 h-5" />}
            />
            <StatCard
              title="Announcements"
              value="14"
              subtitle="Company broadcasts"
              trend="Latest today"
              color="emerald"
              icon={<Megaphone className="w-5 h-5" />}
            />
          </div>
        </section>

        {/* 4. Form Controls */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>4. Form Controls &amp; Inline Validation</span>
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Input
                label="Corporate Email Address"
                placeholder="john.doe@workflow.com"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                value={demoInput}
                onChange={(e) => {
                  setDemoInput(e.target.value)
                  if (e.target.value && !e.target.value.includes('@')) {
                    setDemoError('Please enter a valid corporate email format.')
                  } else {
                    setDemoError('')
                  }
                }}
                error={demoError}
                helperText="First 3 letters + 1234 will be initial password."
              />

              <Select
                label="Leave Type Selection"
                required
                value={demoSelect}
                onChange={(e) => setDemoSelect(e.target.value)}
                options={[
                  { value: 'PLANNED', label: 'Planned Vacation (5-Day Notice)' },
                  { value: 'SICK', label: 'Sick Leave (Immediate)' },
                  { value: 'CASUAL', label: 'Casual Leave (Immediate)' },
                  { value: 'UNPAID', label: 'Emergency / Unpaid Leave' },
                ]}
                helperText="Planned leave requires >= 5 days advance request."
              />

              <Select
                label="User Role Assignment"
                required
                defaultValue="EMPLOYEE"
                options={[
                  { value: 'EMPLOYEE', label: 'Employee (Standard Access)' },
                  { value: 'HR', label: 'HR Manager (Employee Review)' },
                  { value: 'OWNER', label: 'Company Owner (Full Control)' },
                ]}
              />
            </div>

            <Textarea
              label="Leave Request Reason / Policy Document Content"
              placeholder="Provide context or explanation..."
              rows={3}
              value={demoTextarea}
              onChange={(e) => setDemoTextarea(e.target.value)}
              helperText="Markdown and plain text formatting supported."
            />
          </div>
        </section>

        {/* 5. Badges */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>5. Badges (RBAC Roles &amp; Leave Statuses)</span>
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role Badges</h4>
              <div className="flex flex-wrap gap-2.5">
                <Badge variant="OWNER" dot>Owner</Badge>
                <Badge variant="HR" dot>HR Manager</Badge>
                <Badge variant="EMPLOYEE" dot>Employee</Badge>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status Badges</h4>
              <div className="flex flex-wrap gap-2.5">
                <Badge variant="PENDING" dot>Pending Review</Badge>
                <Badge variant="APPROVED" dot>Approved</Badge>
                <Badge variant="REJECTED" dot>Rejected</Badge>
                <Badge variant="ACTIVE" dot>Active</Badge>
                <Badge variant="DEACTIVATED" dot>Deactivated</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Alerts & Error Callouts */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>6. Alerts &amp; Formatted Error Banners</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Alert
              type="error"
              title="Pydantic Server Validation Error (422)"
              message="The backend rejected the request with the following field discrepancies:"
              fieldErrors={[
                { loc: ['body', 'email'], msg: 'Field required' },
                { loc: ['body', 'start_date'], msg: 'Planned leave date must be at least 5 days in the future.' },
              ]}
              onClose={() => toast.info('Alert banner dismissed.')}
            />

            <Alert
              type="warning"
              title="Notice Guard Warning"
              message="You have exhausted your paid leave balance. Submitting this request will record it as an Unpaid / Emergency leave."
            />

            <Alert
              type="success"
              title="Document Successfully Ingested"
              message="Company Employee Handbook was chunked into 4 semantic vectors and saved to pgvector."
            />

            <Alert
              type="info"
              title="First-Time Login Security Requirement"
              message="Your temporary password must be changed before accessing internal dashboards."
            />
          </div>
        </section>

        {/* 7. Modals & Dialogs Showcase */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>7. Modal &amp; Confirmation Dialogs</span>
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-wrap gap-3 items-center">
            <Button
              variant="teal"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Open Validated Leave Modal (Zod Notice Checks)
            </Button>

            <Button
              variant="danger"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setIsConfirmOpen(true)}
            >
              Open Destructive Confirm Dialog
            </Button>
          </div>
        </section>

        {/* 8. Skeletons & Spinners */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>8. Loading Skeletons &amp; Spinners</span>
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-6">
            <div className="flex items-center space-x-6">
              <span className="text-xs text-slate-400 font-semibold">Spinners:</span>
              <Spinner size="xs" color="orange" />
              <Spinner size="sm" color="teal" />
              <Spinner size="md" color="white" />
              <Spinner size="lg" color="orange" />
            </div>

            <div className="pt-4 border-t border-slate-700/60">
              <span className="text-xs text-slate-400 font-semibold block mb-3">Table Skeleton Placeholder:</span>
              <TableSkeleton rows={3} columns={4} />
            </div>
          </div>
        </section>
      </main>

      {/* Live React Hook Form + Zod Validated Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          leaveForm.reset()
        }}
        title="Apply for Company Leave (Zod Validated)"
        description="Date inputs strictly enforce notice rules & block past dates in real-time."
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsModalOpen(false)
                leaveForm.reset()
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={leaveForm.handleSubmit(onLeaveSubmit)}
            >
              Submit Application
            </Button>
          </>
        }
      >
        <form onSubmit={leaveForm.handleSubmit(onLeaveSubmit)} className="space-y-4 text-left">
          <Select
            label="Leave Category"
            required
            {...leaveForm.register('leave_type')}
            error={leaveForm.formState.errors.leave_type?.message}
            options={[
              { value: 'PLANNED', label: '🏖️ Planned Vacation (Requires ≥ 5 Days Advance Notice)' },
              { value: 'SICK', label: '🤒 Sick Leave (Immediate / Today or Future)' },
              { value: 'CASUAL', label: '☕ Casual Leave (Immediate / Today or Future)' },
              { value: 'UNPAID', label: '⚡ Emergency / Unpaid Leave (Non-blocking)' },
            ]}
            helperText={
              watchLeaveType === 'PLANNED'
                ? `Planned rule active: Earliest selectable start date is ${minStartDate} (5 days notice).`
                : `Immediate leave: Earliest selectable date is today (${todayString}). Past dates strictly disabled.`
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              required
              min={minStartDate}
              {...leaveForm.register('start_date')}
              error={leaveForm.formState.errors.start_date?.message}
              helperText={`Min Date: ${minStartDate}`}
            />

            <Input
              label="End Date"
              type="date"
              required
              min={watchStartDate || minStartDate}
              {...leaveForm.register('end_date')}
              error={leaveForm.formState.errors.end_date?.message}
              helperText={`Min Date: ${watchStartDate || minStartDate}`}
            />
          </div>

          <Textarea
            label="Reason for Absence"
            required
            placeholder="Explain the reason for leave (minimum 5 characters)..."
            rows={3}
            {...leaveForm.register('reason')}
            error={leaveForm.formState.errors.reason?.message}
          />

          <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold">Test Presets:</span>
            <button
              type="button"
              onClick={() => {
                leaveForm.setValue('leave_type', 'PLANNED')
                leaveForm.setValue('start_date', minStartDate)
                leaveForm.setValue('end_date', minStartDate)
                leaveForm.setValue('reason', 'Annual family vacation')
                leaveForm.clearErrors()
              }}
              className="text-[11px] px-2 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors"
            >
              Fill Valid 5-Day Planned Leave
            </button>

            <button
              type="button"
              onClick={() => {
                leaveForm.setValue('leave_type', 'PLANNED')
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                const tomorrowStr = tomorrow.toISOString().split('T')[0]
                leaveForm.setValue('start_date', tomorrowStr)
                leaveForm.setValue('end_date', tomorrowStr)
                leaveForm.setValue('reason', 'Short notice trip')
                leaveForm.trigger()
              }}
              className="text-[11px] px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            >
              Test Invalid Notice (&lt;5 Days)
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Demo */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={isActionLoading}
        title="Deactivate Employee Account?"
        message="This will soft-delete the employee (is_active = false). They will be immediately blocked from signing in until an administrator reactivates their account."
        confirmText="Yes, Deactivate"
        confirmVariant="danger"
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Workflow Enterprise Platform &bull; Reusable UI Catalog Active &bull; Dark Mode Enterprise
      </footer>
    </div>
  )
}
