<template>
  <Popover v-if="userInfo">
    <template #content>
      <div class="flex w-64 justify-between">
        <Avatar :src="userInfo.avatar" :size="96" class="flex-shrink-0">
          {{ userInfo.avatar ? null : userInfo.memberName[0] }}
        </Avatar>
        <div class="ml-4 justify-self-start">
          <h2 class="text-xl">{{ userInfo.memberName }}</h2>
          <p>{{ userInfo.desc }}</p>
          <div class="flex flex-wrap items-center">
            <div v-for="item in snsSiteMap" :key="item" class="m-1 cursor-pointer">
              <SnsSite
                v-if="userInfo.snsSite && userInfo.snsSite[item]"
                :site="item"
                :value="userInfo.snsSite[item] || ''"
                :need-text="false"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
    <Avatar :src="userInfo.avatar" style="margin: 3px">
      {{ userInfo.avatar ? null : userInfo.memberName[0] }}
    </Avatar>
  </Popover>
</template>
<script setup lang="ts">
  import { MemberVo } from '/@/api/member/model/memberEntity'
  import { SnsSite } from '/@/components/SnsSite'
  import { Avatar, Popover } from 'ant-design-vue'
  const snsSiteMap: Site[] = ['bilibili', 'youtube', 'personalWebsite', 'niconico', 'twitter']
  withDefaults(
    defineProps<{
      userInfo: MemberVo | null
    }>(),
    {
      userInfo: null,
    },
  )
</script>
<style lang="less" scoped></style>
