import { defineNuxtPlugin, useRouter, useRuntimeConfig } from '#app'
import { nextTick } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

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
        eventData
      })
    }).catch((err) => {
      // Fail silently to avoid interrupting user flows
      console.error('Analytics tracking failed:', err)
    })
  }

  if (process.client) {
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
