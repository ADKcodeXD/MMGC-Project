import { create } from 'zustand'
import { authApi } from '../api/modules'
import type { MemberVo } from '../types'

type AuthState = {
  token: string
  user: MemberVo | null
  setToken: (token: string) => void
  fetchUser: () => Promise<void>
  clear: () => void
}

const STORAGE_KEY = 'mmgc_admin_next_token'

export const authStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(STORAGE_KEY) || '',
  user: null,
  setToken: token => {
    localStorage.setItem(STORAGE_KEY, token)
    set({ token })
  },
  fetchUser: async () => {
    if (!get().token) return
    try {
      const user = await authApi.getMyInfo()
      set({ user })
    } catch {
      get().clear()
    }
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ token: '', user: null })
  }
}))

export function useAuthStore() {
  return authStore()
}
