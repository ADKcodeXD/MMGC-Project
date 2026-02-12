import type { StatisticsModel } from '~~/types/statistics.type'
import { getRankList } from '~/composables/apis/statistics'

export const useStatistics = () => {
  const rankList = ref<StatisticsModel[]>([])
  const total = ref(0)
  const showType = ref('platinum')
  const orderCondition = ref<'' | 'reverse'>('')
  const orderField = ref('participateTimes')
  const isLoading = ref(false)
  const body = ref()
  const pageParams = ref({
    page: 1,
    pageSize: 10,
    keyword: undefined
  })

  const goldAuthors = computed(() => {
    return rankList.value.filter(item => item.authorType === 'gold')
  })

  const platinumAuthors = computed(() => {
    return rankList.value.filter(item => item.authorType === 'platinum')
  })

  const getRankListFn = useDebounce(async () => {
    if (isLoading.value) return
    const notLoad = total.value > 0 && rankList.value.length >= total.value
    if (notLoad && pageParams.value.page > 1) return

    try {
      isLoading.value = true
      const data = await getRankList({
        orderRule: orderCondition.value,
        sortRule: orderField.value,
        ...pageParams.value
      })
      if (!data.data) return

      const newResults = data.data.result || []
      if (pageParams.value.page === 1) {
        rankList.value = newResults
      } else {
        if (newResults.length === 0) return
        rankList.value = useUniqBy([...rankList.value, ...newResults], '_id')
      }
      total.value = data.data.total
    } finally {
      isLoading.value = false
    }
  }, 100)

  const isActive = (field: string, order: string) => {
    return field === orderField.value && order === orderCondition.value
  }

  const changeFields = (field: string, order: string) => {
    if (isActive(field, order)) return
    pageParams.value.page = 1
    pageParams.value.keyword = undefined
    rankList.value = []
    orderField.value = field
    orderCondition.value = order as any
    getRankListFn()
  }

  const handleScroll = useDebounce(() => {
    if (!body.value || isLoading.value) return
    const bottomOfWindow =
      body.value.scrollTop + body.value.clientHeight >= body.value.scrollHeight - 200
    const notLoad = total.value > 0 && rankList.value.length >= total.value

    if (bottomOfWindow && !notLoad) {
      pageParams.value.page++
      getRankListFn()
    }
  }, 150)

  watch([() => pageParams.value.keyword, orderField, orderCondition], () => {
    pageParams.value.page = 1
    rankList.value = []
    getRankListFn()
  })

  onMounted(() => {
    const initBody = () => {
      body.value = document.getElementById('freeBody')
      if (body.value) {
        body.value.addEventListener('scroll', handleScroll)
        body.value.addEventListener('touchmove', handleScroll)
      } else {
        setTimeout(initBody, 100)
      }
    }
    initBody()
    getRankListFn()
  })

  onUnmounted(() => {
    if (body.value) {
      body.value.removeEventListener('scroll', handleScroll)
      body.value.removeEventListener('touchmove', handleScroll)
    }
  })

  return {
    rankList,
    total,
    showType,
    orderCondition,
    orderField,
    isLoading,
    pageParams,
    goldAuthors,
    platinumAuthors,
    getRankListFn,
    isActive,
    changeFields,
    handleScroll
  }
}
