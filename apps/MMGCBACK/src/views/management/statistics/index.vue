<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" color="success" @click="handleAdd">新增人员</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <div class="flex">
            <TableAction
              :actions="[
                {
                  icon: 'ant-design:edit-outlined',
                  onClick: () => handleEdit(record),
                },
              ]"
            />
            <TableAction
              :actions="[
                {
                  icon: 'ant-design:delete-outlined',
                  color: 'error',
                  popConfirm: {
                    title: '是否确认删除',
                    placement: 'left',
                    confirm: () => {
                      handleDeleteOne(record._id)
                    },
                  },
                },
              ]"
            />
          </div>
        </template>
        <template v-if="column.key === 'authorAvatar'">
          <TableImg :img-list="[record.authorAvatar]" :simpleShow="true" class="w-64 h-64" />
        </template>
        <template v-if="column.key === 'authorType'">
          <Tag>
            {{ options.find((item) => item.value === record.authorType)?.label }}
          </Tag>
        </template>
        <template v-if="column.key === 'participateMacthes'">
          <div class="flex flex-wrap gap-2">
            <Tag v-for="item in record.participateMacthes" :key="uniqueId('key')" color="#309fee">
              {{ item }}
            </Tag>
          </div>
        </template>
      </template>
    </BasicTable>
    <AuthorInfoModal
      @register="registerModal"
      @success="refresh"
      :record="currentRecord"
      @close="refresh(false)"
    />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable, useTable, TableAction, TableImg, BasicColumn } from '/@/components/Table'
  import { getAuthorList, deleteAuthor } from '/@/api/statistics/statistics'
  import { useMessage } from '/@/hooks/web/useMessage'
  import { useModal } from '/@/components/Modal'
  import AuthorInfoModal from './AuthorInfoModal.vue'
  import { cloneDeep, uniqueId } from 'lodash'
  import { Tag } from 'ant-design-vue'
  import { ref } from 'vue'
  const columns: BasicColumn[] = [
    {
      title: '作者头像',
      dataIndex: 'authorAvatar',
    },
    {
      title: '作者昵称',
      dataIndex: 'authorName',
    },
    {
      title: '作者级别',
      dataIndex: 'authorType',
    },
    {
      title: '连续参加届数',
      dataIndex: 'consecutiveParticipateTimes',
    },
    {
      title: '累计参加届数',
      dataIndex: 'participateTimes',
    },
    {
      title: '参加年份',
      dataIndex: 'participateMacthes',
    },
  ]

  const options = [
    {
      label: '白金作者',
      value: 'platinum',
    },
    {
      label: '黄金作者',
      value: 'gold',
    },
    {
      label: '不指定',
      value: 'normal',
    },
  ]

  const { createMessage } = useMessage()
  const [registerTable, { reload }] = useTable({
    title: '统计',
    api: getAuthorList,
    columns,
    formConfig: {
      labelWidth: 100,
    },
    pagination: true,
    striped: true,
    useSearchForm: false,
    showTableSetting: false,
    bordered: true,
    showIndexColumn: false,
    canResize: true,
    clearSelectOnPageChange: true,
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      fixed: undefined,
    },
  })
  const [registerModal, { openModal }] = useModal()

  const currentRecord = ref()

  const handleAdd = () => {
    openModal(true)
  }

  const handleEdit = (record: any) => {
    openModal(true, {
      record,
      isUpdate: true,
    })
    currentRecord.value = cloneDeep(record)
  }

  const handleDeleteOne = (id: string): any => {
    deleteAuthor(id).then(async () => {
      createMessage.success('删除成功')
      reload()
    })
    return
  }

  const refresh = (needReq = true) => {
    currentRecord.value = null
    if (needReq) reload()
  }
</script>
