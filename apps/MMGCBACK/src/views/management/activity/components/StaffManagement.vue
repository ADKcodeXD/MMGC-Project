<template>
  <div class="staff-management">
    <div class="staff-grid">
      <div
        v-for="(item, index) in staffList"
        :key="index"
        class="staff-card"
        @click="openEdit(index)"
      >
        <div class="staff-card-avatar">
          <img
            v-if="item.avatar"
            :src="item.avatar"
            class="avatar-img"
            referrerpolicy="no-referrer"
          />
          <Icon v-else icon="ant-design:user-outlined" :size="20" color="#bbb" />
        </div>
        <p class="staff-card-name" :title="item.name">{{ item.name || '未填写' }}</p>
        <a-tag :color="roleColor[item.role]" size="small">{{ roleLabel[item.role] }}</a-tag>
      </div>
      <div class="staff-card staff-card--add" @click="openAdd" v-if="!disabled">
        <div class="staff-card-avatar staff-card-avatar--add">
          <Icon icon="ant-design:plus-outlined" :size="20" />
        </div>
        <p class="staff-card-name">添加人员</p>
      </div>
    </div>

    <a-modal
      v-model:visible="modalVisible"
      :title="editingIndex === -1 ? '添加人员' : '编辑人员'"
      @ok="handleOk"
      @cancel="handleCancel"
      :destroyOnClose="true"
    >
      <a-form layout="vertical" class="p-4">
        <a-form-item label="个人链接">
          <a-input
            :value="form.link || ''"
            @update:value="onLinkInput"
            placeholder="https://space.bilibili.com/12345 或其他链接"
          >
            <template #suffix>
              <a-spin v-if="fetchingBili" size="small" />
              <Icon
                v-else-if="biliFetched"
                icon="ant-design:check-circle-outlined"
                color="#52c41a"
              />
            </template>
          </a-input>
          <p class="text-xs text-gray-400 mt-1">直接输入B站空间链接可自动提取头像和昵称</p>
          <p v-if="biliFetchError" class="text-red-400 text-xs mt-1">{{ biliFetchError }}</p>
        </a-form-item>
        <a-form-item label="头像">
          <UploadImg
            :online-img="form.avatar ?? ''"
            @change-img="(val) => (form.avatar = val || null)"
            :aspect-ratio="1"
          />
        </a-form-item>
        <a-form-item label="名字">
          <a-input v-model:value="form.name" placeholder="请输入人员名称" />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="form.role">
            <a-select-option value="organizer">主办人</a-select-option>
            <a-select-option value="judge">评委</a-select-option>
            <a-select-option value="translator">翻译</a-select-option>
            <a-select-option value="others">其他贡献者</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      <template #footer>
        <div class="flex justify-between">
          <a-button v-if="editingIndex !== -1" danger @click="handleDelete">删除</a-button>
          <div v-else></div>
          <div class="flex gap-2">
            <a-button @click="handleCancel">取消</a-button>
            <a-button type="primary" @click="handleOk">确定</a-button>
          </div>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch } from 'vue'
  import {
    Modal as AModal,
    Button as AButton,
    Input as AInput,
    Select as ASelect,
    SelectOption as ASelectOption,
    Form as AForm,
    FormItem as AFormItem,
    Tag as ATag,
    Spin as ASpin,
  } from 'ant-design-vue'
  import { Icon } from '/@/components/Icon'
  import UploadImg from '/@/components/UploadImg/UploadImg.vue'
  import { getBiliUserInfo } from '/@/api/bilibili/bilibili'

  interface StaffItem {
    name: string
    avatar?: string | null
    link?: string | null
    role: 'organizer' | 'judge' | 'translator' | 'others'
  }

  const roleLabel: Record<string, string> = {
    organizer: '主办人',
    judge: '评委',
    translator: '翻译',
    others: '贡献者',
  }

  const roleColor: Record<string, string> = {
    organizer: 'red',
    judge: 'blue',
    translator: 'green',
    others: 'default',
  }

  const props = defineProps<{
    value?: StaffItem[] | null
    disabled?: boolean
  }>()

  const emit = defineEmits(['update:value', 'change'])

  const staffList = ref<StaffItem[]>([])
  const modalVisible = ref(false)
  const editingIndex = ref(-1) // -1 = 新增
  const form = reactive<StaffItem>({
    name: '',
    avatar: null,
    link: '',
    role: 'others',
  })

  watch(
    () => props.value,
    (val) => {
      staffList.value = val ? [...val] : []
    },
    { immediate: true, deep: true },
  )

  const resetForm = () => {
    form.name = ''
    form.avatar = null
    form.link = ''
    form.role = 'others'
    biliFetched.value = false
    biliFetchError.value = ''
  }

  const openAdd = () => {
    if (props.disabled) return
    editingIndex.value = -1
    resetForm()
    modalVisible.value = true
  }

  const openEdit = (index: number) => {
    if (props.disabled) return
    editingIndex.value = index
    const item = staffList.value[index]
    form.name = item.name
    form.avatar = item.avatar ?? null
    form.link = item.link ?? ''
    form.role = item.role
    modalVisible.value = true
  }

  const handleOk = () => {
    const data: StaffItem = { ...form }
    if (editingIndex.value === -1) {
      staffList.value.push(data)
    } else {
      staffList.value[editingIndex.value] = data
    }
    emitChange()
    modalVisible.value = false
  }

  const handleCancel = () => {
    modalVisible.value = false
  }

  const handleDelete = () => {
    if (editingIndex.value >= 0) {
      staffList.value.splice(editingIndex.value, 1)
      emitChange()
    }
    modalVisible.value = false
  }

  // ---- Bilibili 链接自动提取 ----
  const fetchingBili = ref(false)
  const biliFetched = ref(false)
  const biliFetchError = ref('')

  /**
   * 从 B 站链接中提取 UID
   * 支持: space.bilibili.com/12345, bilibili.com/space/12345 等
   */
  function extractBiliUid(url: string): number | null {
    const patterns = [
      /space\.bilibili\.com\/(\d+)/,
      /bilibili\.com\/space\/(\d+)/,
      /b23\.tv\/(\d+)/,
    ]
    for (const p of patterns) {
      const m = url.match(p)
      if (m) return Number(m[1])
    }
    return null
  }

  let fetchTimer: ReturnType<typeof setTimeout> | null = null

  const onLinkInput = (v: string) => {
    form.link = v
    biliFetched.value = false
    biliFetchError.value = ''

    const uid = extractBiliUid(v)
    if (!uid) return

    // 防抖 500ms
    if (fetchTimer) clearTimeout(fetchTimer)
    fetchTimer = setTimeout(async () => {
      fetchingBili.value = true
      biliFetchError.value = ''
      try {
        const res = await getBiliUserInfo(uid)
        const info = res.data
        if (info) {
          if (!form.name) form.name = info.name
          if (!form.avatar) form.avatar = info.face
          biliFetched.value = true
        }
      } catch {
        biliFetchError.value = '获取B站信息失败'
      } finally {
        fetchingBili.value = false
      }
    }, 500)
  }

  const emitChange = () => {
    emit('update:value', [...staffList.value])
    emit('change', [...staffList.value])
  }
</script>

<style lang="less" scoped>
  .ant-form {
    padding: 8px;
  }
  .staff-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .staff-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      opacity: 0.8;
    }

    &--add {
      .staff-card-avatar {
        border: 1px dashed #d9d9d9;
        color: #999;
        &:hover {
          border-color: @primary-color;
          color: @primary-color;
        }
      }
      .staff-card-name {
        color: #999;
      }
    }
  }

  .staff-card-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-bottom: 4px;

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .staff-card-name {
    font-size: 12px;
    text-align: center;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 2px;
  }
</style>
