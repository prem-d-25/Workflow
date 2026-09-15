import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  Bot,
  CalendarCheck,
  Megaphone,
  Settings,
  Users,
} from 'lucide-react'
import { ToastContainer } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

import { LoginView } from '@/views/auth/LoginView'
import { RegisterView } from '@/views/auth/RegisterView'
import { ResetPasswordView } from '@/views/auth/ResetPasswordView'
import { DashboardPlaceholderView } from '@/views/dashboard/DashboardPlaceholderView'
import { ComponentCatalogView } from '@/views/catalog/ComponentCatalogView'
import { SectionPlaceholderView } from '@/views/common/SectionPlaceholderView'

export default function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    // Hydrate session & verify HttpOnly refresh token on startup
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      {/* High-priority Global Toast Notifications (z-[9999], never hidden by navbar) */}
      <ToastContainer />

      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        {/* Phase 7.3 Standalone Reusable UI Components Catalog */}
        <Route path="/ui-catalog" element={<ComponentCatalogView />} />

        {/* First-Login Mandatory Password Reset */}
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute requireActive={false}>
              <ResetPasswordView />
            </ProtectedRoute>
          }
        />

        {/* Authenticated Workspace Application Shell (Phase 7.5) */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Main Dashboard Overview */}
          <Route path="/dashboard" element={<DashboardPlaceholderView />} />

          {/* Phase 7.6: Leave Management */}
          <Route
            path="/leaves"
            element={
              <SectionPlaceholderView
                title="Leave Management & Quotas"
                description="Apply for sick, casual, and planned vacation with 5-day notice guards and manager approval queues."
                icon={CalendarCheck}
                phase="7.6"
                features={[
                  'Visual Quota Summary (Sick, Casual, Planned, Unpaid)',
                  'Zod Validated Leave Application Modal',
                  'HR & Owner Review / Approval Queue',
                  'Tenant Notice Enforcement Guards',
                ]}
              />
            }
          />

          {/* Phase 7.7: Team & Employee Management (HR & OWNER only) */}
          <Route
            path="/employees"
            element={
              <RoleGuard allowedRoles={['OWNER', 'HR']}>
                <SectionPlaceholderView
                  title="Team Directory & Employee Provisioning"
                  description="Manage organization staff, provision accounts with temporary passwords, and control access."
                  icon={Users}
                  phase="7.7"
                  features={[
                    'Staff Directory with Role and Status Badges',
                    'Invite / Provision Employee with Auto-Generated Password',
                    'Hierarchical Safeguards (HR cannot modify Owner)',
                    'Soft-delete Account Deactivation',
                  ]}
                />
              </RoleGuard>
            }
          />

          {/* Phase 7.8: Announcements Bulletin Feed */}
          <Route
            path="/announcements"
            element={
              <SectionPlaceholderView
                title="Company Broadcast Announcements"
                description="Publish and read company-wide memos, policy updates, and executive announcements."
                icon={Megaphone}
                phase="7.8"
                features={[
                  'Chronological Broadcast Feed',
                  'Role-Gated Publishing Modal (HR & Owner)',
                  'Real-time Toast Alerts for New Memos',
                ]}
              />
            }
          />

          {/* Phase 7.9: AI Policy Assistant & pgvector Ingestion */}
          <Route
            path="/policies"
            element={
              <SectionPlaceholderView
                title="AI Policy Assistant & Document Management"
                description="Tenant-isolated semantic search using pgvector and Groq LLM to query company guidelines."
                icon={Bot}
                phase="7.9"
                features={[
                  'Interactive Groq Chatbot with Prompt Guardrails',
                  'Tenant-Isolated Semantic Search (384-dim pgvector)',
                  'PDF / Markdown / Text Document Ingestion',
                  'Owner-Only Document Upload & Deletion',
                ]}
              />
            }
          />

          {/* Company Settings (OWNER only) */}
          <Route
            path="/settings"
            element={
              <RoleGuard allowedRoles={['OWNER']}>
                <SectionPlaceholderView
                  title="Company Workspace Settings"
                  description="Configure workspace parameters, update branding, and adjust default tenant leave quotas."
                  icon={Settings}
                  phase="7.6/7.10"
                  features={[
                    'Update Organization Display Name & Logo',
                    'Custom Default Leave Quotas (Sick, Casual, Paid)',
                    'Tenant Security Policies',
                  ]}
                />
              </RoleGuard>
            }
          />
        </Route>

        {/* Root Redirect to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all 404 handler */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
