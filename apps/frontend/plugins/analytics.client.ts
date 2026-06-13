import { defineNuxtPlugin, useRouter, useRuntimeConfig } from '#app'
import { nextTick } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  const getVisitorId = () => {
    const key = 'mmgc_visitor_id'
    const existing = window.localStorage.getItem(key)
    if (existing) return existing
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(key, id)
    return id
  }

  const trackEvent = (eventType: 'pv' | 'click', eventKey?: string, eventData?: any) => {
    if (!process.client) return
    const { apiPrefix } = useRuntimeConfig().public
    const url = `${apiPrefix}/statistics/track`

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pageUrl: window.location.pathname + window.location.search,
        eventType,
        eventKey,
        eventData,
        visitorId: getVisitorId()
      }),
      keepalive: true
    }).catch((err) => {
      // Fail silently to avoid interrupting user flows
      console.error('Analytics tracking failed:', err)
    })
  }

  if (process.client) {
    nextTick(() => {
      const current = router.currentRoute.value
      trackEvent('pv', 'page_view', {
        path: current.path,
        name: current.name as string,
        query: current.query
      })
    })

    router.afterEach((to) => {
      nextTick(() => {
        trackEvent('pv', 'page_view', {
          path: to.path,
          name: to.name as string,
          query: to.query
        })
      })
    })
  }

  return {
    provide: {
      track: (eventKey: string, eventData?: any) => {
        if (process.client) {
          trackEvent('click', eventKey, eventData)
        }
      }
    }
  }
})
