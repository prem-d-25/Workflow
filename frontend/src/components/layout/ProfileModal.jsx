import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building2,
  Calendar,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Shield,
  User,
} from 'lucide-react'
import { Alert, Badge, Button, Input, Modal } from '@/components/ui'
import { resetPasswordSchema } from '@/lib/validations'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'

export function ProfileModal({ isOpen, onClose }) {
  const { user, company, changePassword } = useAuthStore()
  const [activeTab, setActiveTab] = useState('details') // 'details' | 'password'
  const [apiError, setApiError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  const handlePasswordSubmit = async (data) => {
    setApiError(null)
    setIsSuccess(false)
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      })
      setIsSuccess(true)
      toast.success('Your corporate password has been updated.', 'Password Changed')
      reset()
      setTimeout(() => {
        setIsSuccess(false)
        setActiveTab('details')
      }, 1500)
    } catch (err) {
      setApiError(err.friendlyMessage || 'Failed to change password. Please check your credentials.')
    }
  }

  const handleClose = () => {
    setApiError(null)
    setIsSuccess(false)
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="User Profile & Security"
      description="Manage your corporate identity and account security credentials."
      size="lg"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-700/80 mb-5">
        <button
          type="button"
          onClick={() => {
            setActiveTab('details')
            setApiError(null)
          }}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'details'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Profile Details
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('password')
            setApiError(null)
          }}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'password'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Change Password
        </button>
      </div>

      {/* Tab: Details */}
      {activeTab === 'details' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-600/20">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">
                  {user?.full_name || user?.email?.split('@')[0]}
                </h4>
                <Badge variant={user?.role || 'EMPLOYEE'} size="sm">
                  {user?.role}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-teal-400">
                <Shield className="w-3 h-3" />
                <span>Multi-Tenant RBAC Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-400" />
                Company Workspace
              </span>
              <span className="font-semibold text-white">{company?.name || 'Workflow Tenant'}</span>
              <span className="block text-[11px] text-slate-400 font-mono">
                Tenant ID: #{user?.company_id}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                Account Status
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant={user?.is_active !== false ? 'ACTIVE' : 'DEACTIVATED'} dot size="sm">
                  {user?.is_active !== false ? 'Active Account' : 'Deactivated'}
                </Badge>
              </div>
              <span className="block text-[11px] text-slate-400 mt-1">
                Refresh Cookie: <strong className="text-teal-400">HttpOnly Protected</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Change Password */}
      {activeTab === 'password' && (
        <form onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-4">
          {apiError && (
            <Alert
              type="error"
              title="Update Failed"
              message={apiError}
              onClose={() => setApiError(null)}
            />
          )}

          {isSuccess && (
            <Alert
              type="success"
              title="Password Updated"
              message="Your new credentials have been safely saved to the system."
            />
          )}

          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            required
            leftIcon={<KeyRound className="w-4 h-4" />}
            {...register('current_password')}
            error={errors.current_password?.message}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            required
            leftIcon={<Lock className="w-4 h-4" />}
            {...register('new_password')}
            error={errors.new_password?.message}
            helperText="Minimum 6 characters."
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            required
            leftIcon={<Lock className="w-4 h-4" />}
            {...register('confirm_password')}
            error={errors.confirm_password?.message}
          />

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
            >
              Update Password
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
