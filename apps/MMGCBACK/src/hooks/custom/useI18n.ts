import { ref } from 'vue'

export function useI18nMmgc() {
  const activeTab = ref<string>('cn')
  const tabList = ['cn', 'jp', 'en']
  return {
    activeTab,
    tabList,
  }
}
