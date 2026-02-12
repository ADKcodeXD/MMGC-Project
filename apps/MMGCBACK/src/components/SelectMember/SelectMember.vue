<template>
  <Select
    v-model:value="value"
    :mode="mode"
    :placeholder="placeholder"
    showSearch
    style="width: 100%"
    :filter-option="false"
    :not-found-content="isLoading ? undefined : null"
    :options="options"
    :disabled="disabled"
    @search="getUserInfo"
    @change="handleChange"
  >
    <template v-if="isLoading" #notFoundContent>
      <Spin size="small" />
    </template>
    <template #option="{ label, avatar }">
      <div class="p-2 w-full flex justify-between items-center h-10">
        <Avatar :src="avatar" v-if="avatar" class="flex-shrink-0" />
        <Avatar :src="avatar" v-else class="flex-shrink-0">
          {{ label.slice(0, label.length > 5 ? 5 : label.length) }}
        </Avatar>
        <p>{{ label }}</p>
      </div>
    </template>
  </Select>
</template>
<script setup lang="ts">
  import { debounce } from 'lodash-es'
  import { Select, Spin, Avatar } from 'ant-design-vue'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { getUserList } from '/@/api/member/member'
  const userData = ref<Array<any>>([])
  const isLoading = ref(false)
  const pageParams = reactive<PageParams>({
    page: 1,
    pageSize: 10,
  })
  const value = ref<number[] | number>()
  const options = computed(() => {
    return userData.value?.map((item) => {
      return {
        value: item.memberId,
        label: item.memberName,
        avatar: item.avatar,
      }
    })
  })
  withDefaults(
    defineProps<{
      placeholder?: string
      mode?: 'multiple' | 'tags' | 'SECRET_COMBOBOX_MODE_DO_NOT_USE' | undefined
      disabled?: boolean
    }>(),
    {
      placeholder: '请选择用户',
      mode: undefined,
      disabled: false,
    },
  )
  const getUserInfo = debounce(async (val?: string) => {
    isLoading.value = true
    pageParams.keyword = val
    const data = await getUserList(pageParams)
    userData.value = data.data.result
    isLoading.value = false
  }, 300)

  const handleChange = (val: number[] | number) => {
    value.value = val
  }

  onMounted(() => {
    getUserInfo()
  })
</script>
<style lang="less" scoped></style>
