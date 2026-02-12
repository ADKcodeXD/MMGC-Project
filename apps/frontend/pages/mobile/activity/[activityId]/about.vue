<template>
  <Transition mode="out-in">
    <div class="fullpage" v-if="activityData && !isLoading">
      <!-- desc 介绍 -->
      <div class="section">
        <div class="desc-like">
          <div>
            <p class="title">
              {{ activityData.activityName[locale] || activityData.activityName.cn }}
            </p>
            <div
              v-if="activityData.desc"
              v-html="activityData.desc[locale] || activityData.desc['cn']"
            />
          </div>
          <!-- 鸣谢 -->
          <div
            v-if="activityData.sponsorListVo && activityData.sponsorListVo.length"
            class="mt-6 text-center"
          >
            <p class="title mb-2">{{ $t('thanks') }}</p>
            <p class="text-sm opacity-80 mb-3">
              {{ $t('sponsoredBy', { sponsor: sponsorNames }) }}
            </p>
            <div class="flex flex-wrap justify-center gap-4">
              <MyCustomImage
                v-for="sponsor in activityData.sponsorListVo"
                :key="sponsor.sponsorId"
                :img="sponsor.sponsorLogo"
                class="w-28 h-16 object-contain"
              />
            </div>
          </div>
          <!-- Staff -->
          <div
            v-if="activityData.staff && activityData.staff.length"
            class="mt-6 flex flex-col items-center"
          >
            <p class="title mb-2">Staff</p>
            <div class="flex flex-col items-center w-full">
              <template v-for="(members, role) in groupedStaff" :key="role">
                <div class="my-3 flex flex-col items-center w-full">
                  <p class="my-1 text-sm opacity-80">{{ role }}</p>
                  <div class="flex flex-wrap gap-3 justify-center">
                    <div
                      v-for="member in members"
                      :key="member.name"
                      class="flex flex-col items-center"
                    >
                      <a :href="member.link" target="_blank" v-if="member.link" class="block">
                        <img
                          :src="member.avatar || '/default-avatar.png'"
                          class="w-12 h-12 rounded-full border border-gray-200"
                        />
                      </a>
                      <img
                        v-else
                        :src="member.avatar || '/default-avatar.png'"
                        class="w-12 h-12 rounded-full border border-gray-200"
                      />
                      <span class="text-xs mt-1 text-center px-2">{{ member.name }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <!-- rules -->
      <div class="section" v-if="activityData.rules">
        <div class="desc-like">
          <p class="title">{{ $t('warning') }}</p>
          <div v-html="activityData.rules[locale] || activityData.rules['cn']" />
        </div>
      </div>
      <!-- other -->
      <div class="section" v-if="activityData.timesorother">
        <div class="desc-like">
          <p class="title">{{ $t('其他') }}</p>
          <div v-html="activityData.timesorother[locale] || activityData.timesorother['cn']" />
        </div>
      </div>
      <!-- faq -->
      <div class="section" v-if="activityData.faq">
        <div class="desc-like">
          <p class="title">FAQ</p>
          <div v-html="activityData.faq[locale] || activityData.faq['cn']" />
        </div>
      </div>
    </div>
    <MyCustomLoading v-else />
  </Transition>
</template>

<script setup lang="ts">
const { locale } = useCurrentLocale()
const { activityData, isLoading } = useAboutPage()

const sponsorNames = computed(() => {
  if (!activityData.value?.sponsorListVo) return ''
  return activityData.value.sponsorListVo
    .map((s) => s.sponsorName?.[locale.value] || s.sponsorName?.cn || '')
    .filter(Boolean)
    .join('、')
})

const groupedStaff = computed(() => {
  const groups: Record<string, any[]> = {
    主催: [],
    评委: [],
    翻译: [],
    其他: []
  }
  const roleMap: Record<string, string> = {
    organizer: '主催',
    judge: '评委',
    translator: '翻译',
    others: '其他'
  }

  if (activityData.value?.staff && Array.isArray(activityData.value.staff)) {
    activityData.value.staff.forEach((item: any) => {
      const roleLabel = roleMap[item.role] || '其他'
      groups[roleLabel].push(item)
    })
  }

  return Object.entries(groups)
    .filter(([_, members]) => members.length > 0)
    .reduce((acc, [role, members]) => {
      acc[role] = members
      return acc
    }, {} as Record<string, any[]>)
})
</script>

<style lang="scss" scoped>
.fullpage {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  .section {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    .desc-like {
      padding-top: 5%;
      justify-self: flex-start;
      align-self: flex-start;
      width: 95%;
      color: $whiteColor;
      font-size: $normalFontSize;
    }
    .staff-label {
      width: 100px;
      flex-shrink: 0;
    }
  }
  .desc-like {
    align-items: flex-start;
    justify-content: flex-start;
    width: 95%;
    overflow-y: hidden;
  }
  .threeline {
    @include showLine(3);
  }
}
</style>
