<template>
  <div>
    <BasicTable @register="registerTable" :row-selection="{}">
      <template #toolbar>
        <a-button type="primary" color="success" @click="gotoAdd">新建赞助商</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'ant-design:file-text-outlined',
                onClick: goToDetail.bind(null, record.sponsorId),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                popConfirm: {
                  title: '是否确认删除',
                  placement: 'left',
                  confirm: () => {
                    handleDeleteOne(record.sponsorId)
                  },
                },
              },
            ]"
          />
        </template>
        <template v-if="column.key === 'sponsorLogo'">
          <TableImg :img-list="[record.sponsorLogo]" :simpleShow="true" class="w-64 h-64" />
        </template>
        <template v-if="column.key === 'sponsorName'">
          <p class="text-2xl">{{ record.sponsorName.cn }}</p>
        </template>
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  export default {
    name: 'MemberManagement',
  }
</script>

<script lang="ts" setup>
  import { BasicTable, useTable, TableAction, TableImg, BasicColumn } from '/@/components/Table'
  import { deleteSponsor, getSponsorList } from '/@/api/sponsor/sponsor'
  import { useGo } from '/@/hooks/web/usePage'
  import { useMessage } from '/@/hooks/web/useMessage'
  const columns: BasicColumn[] = [
    {
      title: '赞助商Logo',
      dataIndex: 'sponsorLogo',
      width: 100,
    },
    {
      title: '赞助商名称',
      dataIndex: 'sponsorName',
      width: 50,
    },
  ]
  const { createMessage } = useMessage()
  const [registerTable, { reload }] = useTable({
    title: '赞助商列表',
    api: getSponsorList,
    columns,
    formConfig: {
      labelWidth: 100,
    },
    pagination: true,
    striped: false,
    useSearchForm: true,
    showTableSetting: false,
    bordered: true,
    showIndexColumn: false,
    canResize: false,
    clearSelectOnPageChange: true,
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
      fixed: undefined,
    },
  })
  const go = useGo()

  const gotoAdd = () => {
    go('/form/sponsor')
  }

  const handleDeleteOne = (sponsorId: number): any => {
    deleteSponsor(sponsorId).then(async () => {
      createMessage.success('删除成功')
      reload()
    })
    return
  }

  const goToDetail = (id) => {
    go(`/management/sponsor/${id}`)
  }
</script>
