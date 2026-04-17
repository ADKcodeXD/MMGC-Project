import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  // Use `$fetch` which is auto-imported by Nitro
  const apiBase = 'https://mirai-mad.com/mmgcApi'
  
  const routes: string[] = []

  try {
    const rawUrl = 'https://mirai-mad.com/mmgcApi/activity/getActivityList'
    console.log('[sitemap] testing generic fetch to', rawUrl)
    const res = await fetch(rawUrl)
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`)
    const json = await res.json()
    console.log('[sitemap] test success, items:', json?.data?.result?.length)
    
    // Fallback static array just to prove the endpoint works
    return ['/cn/test-passed']
  } catch (err: any) {
    console.error('[sitemap] hard crash:', err.message || err)
    return ['/cn/error-' + (err.message || 'unknown').replace(/\s+/g, '-')]
  }
})
