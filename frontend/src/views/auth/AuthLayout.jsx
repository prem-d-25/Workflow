import React from 'react'
import { Building2, ShieldCheck, Sparkles } from 'lucide-react'

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Branding */}
      <header className="py-6 px-6 sm:px-12 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Workflow
              <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 font-semibold">
                Enterprise
              </span>
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Multi-Tenant &bull; HttpOnly Protected</span>
        </div>
      </header>

      {/* Centered Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/90 border border-slate-700 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl">
            {(title || subtitle) && (
              <div className="text-center mb-6">
                {title && (
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 z-10">
        Workflow Enterprise Platform &bull; Role-Based Access Control &bull; RAG Knowledge Base
      </footer>
    </div>
  )
}
