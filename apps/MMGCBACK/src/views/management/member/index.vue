<template>
  <div>
    <BasicTable @register="registerTable" :row-selection="{}">
      <template #toolbar>
        <a-button type="primary" color="error" @click="handleBatchDelete">删除选中用户</a-button>
        <a-button type="primary" color="success" @click="handleAdd">新建用户</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'ant-design:file-text-outlined',
                onClick: goToDetail.bind(null, record),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                popConfirm: {
                  title: '是否确认删除',
                  placement: 'left',
                  confirm: () => {
                    handleDeleteOne(record.memberId)
                  },
                },
              },
            ]"
          />
        </template>
        <template v-if="column.key === 'avatar'">
          <TableImg :img-list="[record.avatar]" :simpleShow="true" />
        </template>
      </template>
      <template #roleContent="{ record }">
        <Tag color="#2db7f5">{{ transformRoleEnum(record.role) }}</Tag>
      </template>
      <template #snsContent="{ record }">
        <div class="flex flex-wrap justify-center">
          <div v-for="item in snsSiteMap" :key="item" class="m-1 cursor-pointer">
            <SnsSite
              :site="item"
              :value="record.snsSite[item]"
              v-if="record.snsSite && record.snsSite[item]"
            />
          </div>
        </div>
      </template>
      <template #genderContent="{ record }">
        <Tag>{{ record.gender == 1 ? '男' : '女' }}</Tag>
      </template>
    </BasicTable>
    <MemberModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  export default {
    name: 'MemberManagement',
  }
</script>

<script lang="ts" setup>
  import { BasicTable, useTable, TableAction, TableImg } from '/@/components/Table'
  import { batchDeleteUser, getUserListAll } from '/@/api/member/member'
  import { Tag } from 'ant-design-vue'
  import { ROLE } from '/@/enums/roleEnum'
  import { useModal } from '/@/components/Modal'
  import { SnsSite } from '/@/components/SnsSite'
  import MemberModal from './MemberModal.vue'
  import { columns, searchFormSchema } from './data/member.data'
  import { useGo } from '/@/hooks/web/usePage'
  import { useMessage } from '/@/hooks/web/useMessage'
  const { createMessage, createConfirm } = useMessage()
  type Site = 'bilibili' | 'personalWebsite' | 'youtube' | 'niconico' | 'twitter'
  const [registerModal, { openModal }] = useModal()
  const [registerTable, { reload, getSelectRows }] = useTable({
    title: '成员列表',
    api: getUserListAll,
    columns,
    formConfig: {
      labelWidth: 100,
      schemas: searchFormSchema,
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
  const snsSiteMap: Site[] = ['bilibili', 'youtube', 'personalWebsite', 'niconico', 'twitter']
  const transformRoleEnum = (role: string) => {
    let text = ''
    switch (role) {
      case ROLE.ADMIN:
        text = '管理员'
        break
      case ROLE.SUBADMIN:
        text = '子级管理员'
        break
      case ROLE.COMMITTER:
        text = '贡献者'
        break
      case ROLE.GUEST:
        text = '访客'
        break
      case ROLE.GROUPMEMBER:
        text = '群组成员'
        break
    }
    return text
  }

  const handleAdd = (record: Recordable) => {
    openModal(true, {
      record,
      isUpdate: true,
    })
  }

  const handleDeleteOne = (memberId: number): any => {
    batchDeleteUser([memberId]).then(async () => {
      createMessage.success('删除成功')
      reload()
    })
    return
  }

  const handleBatchDelete = async () => {
    const arr = getSelectRows()
    const memberIds = arr.map((item) => item.memberId)
    createConfirm({
      title: '删除多个用户',
      content: '你确定要删除所有选中的用户吗？删除后将无法恢复！',
      onOk: async () => {
        await batchDeleteUser(memberIds)
        createMessage.success('删除成功')
        reload()
      },
      iconType: 'error',
    })
  }

  const goToDetail = (record: Recordable) => {
    go(`/management/member/${record.memberId}`)
  }

  function handleSuccess() {
    reload()
  }
</script>
