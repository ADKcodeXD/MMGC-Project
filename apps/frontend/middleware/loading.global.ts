import { useGlobalStore } from '~~/stores/global'
const map = new Map()
let intialState = false
export default defineNuxtRouteMiddleware(async (to, from) => {
  const state = useGlobalStore()
  if (!intialState) {
    state.initLocale(to.fullPath)
    intialState = true
  }
  if ((!useHas(to.meta, 'needLoading') || to.meta.needLoading) && !map.has(to.fullPath)) {
    state.loading()
    map.set(to.fullPath, true)
  } else {
    state.unloading()
  }
  return
})
