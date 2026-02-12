<template>
  <Select
    :value="value"
    @update:value="updateValue"
    :mode="mode"
    :placeholder="placeholder"
    showSearch
    style="width: 100%"
    :filter-option="false"
    allowClear
    :options="options"
    :disabled="disabled"
    @search="getInfos"
    @change="handleChange"
    @popup-scroll="popupScroll"
  >
    <template v-if="isLoading" #notFoundContent>
      <Spin size="small" class="h-full w-full" />
    </template>
    <template #option="{ label, image }">
      <div class="p-2 w-full flex justify-between items-center h-10">
        <Avatar :src="image" v-if="image" class="flex-shrink-0" />
        <Avatar :src="image" v-else class="flex-shrink-0">
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
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import _ from 'lodash-es'
  const remoteData = ref<Array<any>>([])
  const isLoading = ref(false)
  const pageParams = reactive<PageParams>({
    page: 1,
    pageSize: 10,
  })
  const emit = defineEmits(['update:value'])
  const options: any = computed(() => {
    return remoteData.value?.map((item) => {
      return {
        value: _.result(item, props.customKey.value),
        label: _.result(item, props.customKey.label),
        image: _.result(item, props.customKey.image),
      }
    })
  })
  const props = withDefaults(
    defineProps<{
      customKey: {
        value: string
        label: string
        image: string
      }
      customApi: PromiseFn
      needPage?: boolean
      value: any
      customParams?: any
      placeholder?: string
      mode?: 'multiple' | 'tags' | 'SECRET_COMBOBOX_MODE_DO_NOT_USE' | undefined
      disabled?: boolean
      selected?: any[]
    }>(),
    {
      placeholder: '请选择活动',
      mode: undefined,
      disabled: false,
      needPage: true,
    },
  )
  const getInfos = debounce(async (val?: string) => {
    isLoading.value = true
    pageParams.keyword = val
    if (val) {
      pageParams.page = 1
    }
    const data = await props.customApi(props.needPage ? pageParams : props.customParams)
    if (pageParams.page !== 1 && props.needPage) {
      remoteData.value = [...remoteData.value, ...data.data.result]
    } else {
      remoteData.value = props.needPage ? data.data.result : data.data
    }
    if (props.selected && props.selected.length > 0) {
      remoteData.value = remoteData.value.filter(
        (item) => !props.selected?.includes(_.result(item, props.customKey.value)),
      )
    }
    isLoading.value = false
  }, 300)

  const handleChange = (val: number[] | number) => {
    emit('update:value', val)
  }

  const updateValue = (val: any) => {
    emit('update:value', val)
  }

  const popupScroll = (e) => {
    const target = e.target as HTMLDivElement
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 20) {
      if (pageParams.page && props.needPage) {
        pageParams.page++
        getInfos()
      }
    }
  }

  watch(
    () => props.selected,
    () => {
      getInfos()
    },
  )

  watch(
    () => props.customParams,
    () => {
      if (props.customParams) {
        getInfos()?.then(() => {
          emit('update:value', undefined)
        })
      }
    },
  )

  onMounted(() => {
    getInfos()
  })
</script>
