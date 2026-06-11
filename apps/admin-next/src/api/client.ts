import axios from 'axios'
import type { ResResult } from '../types'
import { authStore } from '../store/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/mmgcApi',
  timeout: 60000
})

api.interceptors.request.use(config => {
  const token = authStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => {
    const payload = response.data as ResResult<unknown>
    if (!payload || typeof payload.code === 'undefined') return response.data
    if (payload.code === 200) return payload.data ?? payload.result ?? null
    throw new Error(payload.msg || '请求失败')
  },
  error => {
    if (error?.response?.status === 401) {
      authStore.getState().clear()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    throw new Error(error?.response?.data?.msg || error?.message || '网络错误')
  }
)

export async function get<T>(url: string, params?: Record<string, unknown>) {
  return api.get<unknown, T>(url, { params })
}

export async function post<T>(url: string, data?: unknown) {
  return api.post<unknown, T>(url, data)
}

export async function put<T>(url: string, data?: unknown) {
  return api.put<unknown, T>(url, data)
}

export async function del<T>(url: string, data?: unknown) {
  return api.delete<unknown, T>(url, { data })
}
