<template>
  <PageWrapper title="活动列表" contentBackground content="新建一套活动，并且关联作品吧。在右上方新建。">
    <template #headerContent>
      <div class="flex justify-end">
        <a-button type="primary" color="success" @click="router.push('/form/activity')">新建活动</a-button>
      </div>
    </template>
    
    <div class="p-4 bg-white dark:bg-dark-900 rounded-md">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <template v-for="item in activityListData.result" :key="item.activityId">
          <div class="group relative bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col">
            <!-- Cover Image -->
            <div class="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-dark-900">
              <img :src="item.activityCover" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <!-- Status Tag overlay -->
              <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full border border-white/20">
                ID: {{ item.activityId }}
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-4 flex-1 flex flex-col">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                {{ item.activityName.cn || '未知活动' }}
              </h3>
              
              <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
                <div class="flex items-center">
                  <span class="mr-2">周期:</span>
                  <span>{{ item.startTime || '未设置' }} ~ {{ item.endTime || '未设置' }}</span>
                </div>
                <div class="flex items-center">
                  <span class="mr-2">天数:</span>
                  <span class="font-medium text-primary">{{ item.days }} 天</span>
                </div>
                <div class="flex items-center" v-if="item.staff?.length">
                  <span class="mr-2">主办方:</span>
                  <span class="truncate">
                    {{ item.staff.filter((s) => s.role === 'organizer').map(s => s.name).join(' / ') }}
                  </span>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="pt-4 mt-auto border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                <a-button type="default" size="small" @click="router.push(`/management/activity/${item.activityId}`)">
                  详情
                </a-button>
                <div class="flex gap-2">
                  <a-button type="primary" size="small" preIcon="ant-design:eye-outlined" @click="openPreview(item)">
                    预览
                  </a-button>
                  <a-button color="error" size="small" @click="() => deleteActivityFn(item.activityId)">
                    删除
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Preview Drawer -->
    <a-drawer
      v-model:visible="previewVisible"
      :title="`活动预览 - ${previewActivity?.activityName?.cn || ''}`"
      placement="right"
      width="100%"
      :body-style="{ padding: 0 }"
      destroyOnClose
    >
      <div class="w-full h-full bg-gray-50 flex flex-col">
        <div class="p-2 bg-gray-100 border-b flex items-center justify-between text-sm text-gray-500">
          <span class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-400"></span>
            <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span class="w-3 h-3 rounded-full bg-green-400"></span>
          </span>
          <span class="bg-white px-4 py-1 rounded-md shadow-sm text-xs font-mono border">{{ previewUrl }}</span>
          <span></span>
        </div>
        <iframe :src="previewUrl" class="w-full flex-1 border-none bg-white"></iframe>
      </div>
    </a-drawer>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { reactive, ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { PageWrapper } from '/@/components/Page'
  import { deleteActivity, getActivityList } from '/@/api/activity/activity'
  import { ActivityVo } from '/@/api/activity/model/activityEntity'
  import { useMessage } from '/@/hooks/web/useMessage'

  const { createConfirm, createMessage } = useMessage()
  const router = useRouter()

  const activityListData = reactive<PageResult<ActivityVo>>({
    page: 0,
    total: 0,
    result: [],
  })
  
  // Preview Drawer State
  const previewVisible = ref(false)
  const previewActivity = ref<ActivityVo | null>(null)
  
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'
  const previewUrl = computed(() => {
    if (!previewActivity.value) return ''
    return `${frontendUrl}/activity/${previewActivity.value.activityId}/about`
  })

  const openPreview = (item: ActivityVo) => {
    previewActivity.value = item
    previewVisible.value = true
  }

  async function getList() {
    const { data } = await getActivityList({ page: 1, pageSize: 100 })
    activityListData.result = data.result
    activityListData.page = data.page
    activityListData.total = data.total
  }
  
  getList()

  const deleteActivityFn = async (activityId: number) => {
    createConfirm({
      title: '删除活动',
      content: '你确定要删除该活动吗？',
      onOk: async () => {
        await deleteActivity(activityId)
        createMessage.success('删除成功')
        await getList()
      },
      iconType: 'warning',
    })
  }
</script>
<style scoped>
</style>
