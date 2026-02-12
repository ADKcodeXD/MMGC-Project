<template>
  <PageWrapper :class="prefixCls" title="活动列表">
    <template #headerContent>
      <div class="flex justify-between items-center">
        <p>新建一套活动，并且关联作品吧。</p>
        <div>
          <a-button color="success" @click="router.push('/form/activity')">新建活动</a-button>
        </div>
      </div>
    </template>
    <div :class="`${prefixCls}__content`">
      <List>
        <template v-for="item in activityListData.result" :key="item.activityId">
          <ListItem class="list">
            <ListItemMeta>
              <template #avatar>
                <Image :width="100" :height="100" :src="item.activityCover" :preview="false" />
              </template>
              <template #title>
                <div class="flex justify-between">
                  <div>{{ item.activityName.cn || '未知活动' }}</div>
                  <div>
                    <a-button
                      color="info"
                      class="mx-2"
                      @click="router.push(`/management/activity/${item.activityId}`)"
                    >
                      详情
                    </a-button>
                    <a-button
                      color="error"
                      class="mx-2"
                      @click="() => deleteActivityFn(item.activityId)"
                    >
                      删除
                    </a-button>
                  </div>
                </div>
              </template>
              <template #description>
                <div class="activity-list-desc">
                  <div class="info-group">
                    <div class="info-item">
                      <span class="label">活动ID:</span>
                      <span class="value">{{ item.activityId }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">周期:</span>
                      <span class='value'>{{ item.startTime || '未设置' }} ~ {{ item.endTime || '未设置' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">天数:</span>
                      <span class="value">{{ item.days }} 天</span>
                    </div>
                  </div>
                  <div class="staff-group" v-if="item.staff?.length">
                    <span class="label">主办方:</span>
                    <span
                      v-for="member in item.staff.filter((s) => s.role === 'organizer')"
                      :key="member.name"
                      class="value"
                    >{{ member.name }}</span>
                  </div>
                </div>
              </template>
            </ListItemMeta>
          </ListItem>
        </template>
      </List>
    </div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { PageWrapper } from '/@/components/Page'
  import { MemberPopover } from '/@/components/MemberPopover'
  import { List, Image, ListItemMeta, ListItem } from 'ant-design-vue'
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
  async function getList() {
    const { data } = await getActivityList({ page: 1, pageSize: 10 })
    activityListData.result = data.result
    activityListData.page = data.page
    activityListData.total = data.total
  }
  const prefixCls = 'list-basic'
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
<style lang="less" scoped>
  .list-basic {
    &__top {
      padding: 24px;
      text-align: center;
      background-color: @component-background;

      &-col {
        &:not(:last-child) {
          border-right: 1px dashed @border-color-base;
        }

        div {
          margin-bottom: 12px;
          font-size: 14px;
          line-height: 22px;
          color: @text-color;
        }

        p {
          margin: 0;
          font-size: 24px;
          line-height: 32px;
          color: @text-color;
        }
      }
    }

    &__content {
      padding: 24px;
      margin-top: 12px;
      background-color: @component-background;

      .list {
        position: relative;
      }

      .icon {
        font-size: 40px !important;
      }

      .description {
        display: inline-block;
        width: 100%;
      }

      .activity-list-desc {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;

        .info-group {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;

          .info-item {
            display: flex;
            align-items: center;
            font-size: 14px;

            .label {
              color: @text-color-secondary;
              margin-right: 8px;
            }

            .value {
              color: @text-color;
              font-weight: 500;
            }
          }
        }

        .staff-group {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background-color: @background-color-light;
          border-radius: 4px;
          width: fit-content;

          .label {
            color: @text-color-secondary;
            margin-right: 12px;
            font-size: 13px;
          }
        }
      }

      .info {
        display: inline-block;
        width: 30%;
        text-align: center;

        div {
          display: inline-block;
          padding: 0 20px;

          span {
            display: block;
          }
        }
      }

      .progress {
        display: inline-block;
        width: 15%;
        vertical-align: top;
      }
    }
  }
</style>
