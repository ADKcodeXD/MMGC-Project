import { useGlobalStore } from '~~/stores/global'

export const useAboutPage = () => {
  const attrs: { activityId: number } = useAttrs() as any
  const { activityData, isLoading } = useActivityDetail(attrs.activityId)
  const { unloading } = useGlobalStore()

  watchEffect(() => {
    if (!isLoading.value) {
      unloading()
    }
  })

  return {
    activityData,
    isLoading
  }
}
