import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function parseProxy(value?: string) {
  if (!value) return undefined
  try {
    const pairs = JSON.parse(value) as Array<[string, string]>
    return pairs.reduce<Record<string, any>>((proxy, [prefix, target]) => {
      proxy[prefix] = {
        target,
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(new RegExp(`^${prefix}`), '')
      }
      return proxy
    }, {})
  } catch {
    return undefined
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/newAdmin/',
    plugins: [react()],
    server: {
      host: true,
      port: Number(env.VITE_PORT || 3670),
      proxy: parseProxy(env.VITE_PROXY)
    }
  }
})
