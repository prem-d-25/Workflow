import { create } from 'zustand'

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6)
    const newToast = {
      id,
      title: toast.title || null,
      message: toast.message || '',
      type: toast.type || 'info', // 'success' | 'error' | 'warning' | 'info'
      duration: toast.duration || 4000,
    }

    set((state) => ({ toasts: [...state.toasts, newToast] }))

    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, newToast.duration)
    }

    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearAll: () => set({ toasts: [] }),
}))

/**
 * Convenient global toast helper callable from anywhere (components, services, interceptors)
 */
export const toast = {
  success: (message, title = 'Success', duration = 4000) => {
    return useToastStore.getState().addToast({ message, title, type: 'success', duration })
  },
  error: (message, title = 'Error', duration = 5000) => {
    return useToastStore.getState().addToast({ message, title, type: 'error', duration })
  },
  warning: (message, title = 'Warning', duration = 4500) => {
    return useToastStore.getState().addToast({ message, title, type: 'warning', duration })
  },
  info: (message, title = 'Notice', duration = 4000) => {
    return useToastStore.getState().addToast({ message, title, type: 'info', duration })
  },
  dismiss: (id) => {
    useToastStore.getState().removeToast(id)
  },
}
