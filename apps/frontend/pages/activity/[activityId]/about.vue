<template>
  <div class="w-full h-full flex items-center justify-center">
    <Transition mode="out-in">
      <div class="about-page" ref="scrollContainer" v-if="activityData && !isLoading">
        <!-- desc 介绍 -->
        <section ref="sectionDesc" class="about-section">
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
          </div>
        </section>
        <!-- staff 成员 -->
        <section
          ref="sectionStaff"
          class="about-section staff-section"
          v-if="activityData.staff && activityData.staff.length > 0"
        >
          <div class="desc-like staff-container">
            <p class="title text-center">Staff</p>
            <div class="staff-grid">
              <div v-for="(members, role) in groupedStaff" :key="role" class="staff-row">
                <div class="staff-role-label">{{ $t(`staffRole.${role}`) }}</div>
                <div class="staff-members">
                  <div v-for="member in members" :key="member.name" class="staff-member-card">
                    <a :href="member.link" target="_blank" v-if="member.link" class="block">
                      <MyCustomImage
                        :img="member.avatar || '/default-avatar.png'"
                        class="staff-avatar hover:border-primary transition-all"
                      />
                    </a>
                    <MyCustomImage
                      v-else
                      :img="member.avatar || '/default-avatar.png'"
                      class="staff-avatar"
                    />
                    <span class="staff-name">{{ member.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <!-- rules -->
        <section ref="sectionRules" class="about-section" v-if="activityData.rules">
          <div class="desc-like">
            <div v-html="activityData.rules[locale] || activityData.rules['cn']" />
          </div>
        </section>
        <!-- other -->
        <section ref="sectionOther" class="about-section" v-if="activityData.timesorother">
          <div class="desc-like">
            <div v-html="activityData.timesorother[locale] || activityData.timesorother['cn']" />
          </div>
        </section>
        <!-- faq -->
        <section ref="sectionFaq" class="about-section" v-if="activityData.faq">
          <div class="desc-like">
            <div v-html="activityData.faq[locale] || activityData.faq['cn']" />
          </div>
        </section>
      </div>
      <MyCustomLoading v-else />
    </Transition>
    <!-- 侧边导航 -->
    <nav class="about-nav" v-if="activityData && !isLoading">
      <div class="about-nav-track">
        <div
          v-for="(item, index) in navItems"
          :key="item.key"
          class="about-nav-item"
          :class="{ active: currentSection === index }"
          @click="scrollTo(index)"
        >
          <div class="about-nav-dot" />
          <span class="about-nav-label">{{ $t(item.name) }}</span>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { ActivityVo } from '~~/types/activity.type'
import { useGlobalStore } from '~~/stores/global'

const attrs: { activityId: number } = useAttrs() as any
const { locale } = useCurrentLocale()
const { activityData, isLoading } = useActivityDetail(attrs.activityId)
const { unloading } = useGlobalStore()

const scrollContainer = ref<HTMLElement>()
const sectionDesc = ref<HTMLElement>()
const sectionStaff = ref<HTMLElement>()
const sectionRules = ref<HTMLElement>()
const sectionOther = ref<HTMLElement>()
const sectionFaq = ref<HTMLElement>()
const currentSection = ref(0)

const navItems = computed(() => {
  const list: { name: string; key: string }[] = []
  if (!activityData.value) return list
  list.push({ name: 'activityDesc', key: 'desc' })
  if (activityData.value.staff?.length) list.push({ name: 'Staff', key: 'staff' })
  if (activityData.value.rules?.cn) list.push({ name: 'activityRules', key: 'rules' })
  if (activityData.value.timesorother?.cn) list.push({ name: 'warning', key: 'other' })
  if (activityData.value.faq?.cn) list.push({ name: 'faqOther', key: 'faq' })
  return list
})

const sectionRefs = computed(() => {
  const refs: (HTMLElement | undefined)[] = [sectionDesc.value]
  if (activityData.value?.staff?.length) refs.push(sectionStaff.value)
  if (activityData.value?.rules?.cn) refs.push(sectionRules.value)
  if (activityData.value?.timesorother?.cn) refs.push(sectionOther.value)
  if (activityData.value?.faq?.cn) refs.push(sectionFaq.value)
  return refs
})

const scrollTo = (index: number) => {
  const el = sectionRefs.value[index]
  const container = scrollContainer.value
  if (el && container) {
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const top = elRect.top - containerRect.top + container.scrollTop
    container.scrollTo({ top, behavior: 'smooth' })
  }
}

// 通过 IntersectionObserver 追踪当前可见区块
let observer: IntersectionObserver | null = null

const setupObserver = () => {
  if (observer) observer.disconnect()
  const root = scrollContainer.value
  if (!root) return

  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const idx = sectionRefs.value.indexOf(entry.target as HTMLElement)
          if (idx !== -1) {
            currentSection.value = idx
          }
        }
      })
    },
    {
      root,
      threshold: 0.5 // 当区块可见度达到 50% 时触发切换
    }
  )

  sectionRefs.value.forEach(el => {
    if (el) observer?.observe(el)
  })
}

// 监听数据变化和 DOM 挂载，重新初始化观察者
watch(
  [() => sectionRefs.value, () => scrollContainer.value],
  () => {
    nextTick(setupObserver)
  },
  { deep: true }
)

onMounted(() => {
  nextTick(setupObserver)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

const groupedStaff = computed(() => {
  const groups: Record<string, any[]> = {
    organizer: [],
    judge: [],
    translator: [],
    others: []
  }

  if (activityData.value?.staff && Array.isArray(activityData.value.staff)) {
    activityData.value.staff.forEach((item: any) => {
      const role = item.role || 'others'
      if (groups[role]) {
        groups[role].push(item)
      } else {
        groups.others.push(item)
      }
    })
  }

  return Object.entries(groups)
    .filter(([_, members]) => members.length > 0)
    .reduce((acc, [role, members]) => {
      acc[role] = members
      return acc
    }, {} as Record<string, any[]>)
})

watchEffect(() => {
  if (!isLoading.value) {
    unloading()
  }
})
</script>

<style lang="scss" scoped>
.about-page {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  padding-right: 20px;
}

.about-section {
  min-height: 80vh;
  padding: 48px 0;
  display: flex;
  justify-content: center;
  .desc-like {
    width: 95%;
    color: $whiteColor;
    font-size: $normalFontSize;
    padding-top: 2vh;
  }
}

.staff-section {
  align-items: center;
  justify-content: center;
  .staff-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding-top: 0;
  }
}

.staff-grid {
  display: flex;
  flex-direction: column;
  gap: 48px;
  width: 100%;
  max-width: 900px;
  margin-top: 48px;
}

.staff-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.staff-role-label {
  font-size: 24px;
  font-weight: bold;
  color: $themeColor;
  position: relative;
  padding-bottom: 8px;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background: $themeColor;
    border-radius: 2px;
  }
}

.staff-members {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
}

.staff-member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  gap: 8px;
}

.staff-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  object-fit: cover;
}

.staff-name {
  font-size: 12px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* 侧边导航 */
.about-nav {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: none;
}

.about-nav-track {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 6px;
    bottom: 6px;
    width: 1px;
    background: rgba(255, 255, 255, 0.15);
  }
}

.about-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover .about-nav-label {
    opacity: 1;
  }

  &.active {
    .about-nav-dot {
      background: $themeColor;
      box-shadow: 0 0 8px $themeColor;
      transform: scale(1.4);
    }
    .about-nav-label {
      opacity: 1;
      color: $themeColor;
    }
  }
}

.about-nav-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: $themeNotActiveColor;
  flex-shrink: 0;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.about-nav-label {
  font-size: 13px;
  color: $themeNotActiveColor;
  white-space: nowrap;
  opacity: 0.5;
  transition: all 0.3s ease;
  font-weight: 500;
}

@media screen and (min-width: 1440px) {
  .about-page {
    width: 75%;
  }
  .about-section .desc-like {
    width: 80%;
  }
  .about-nav {
    display: block;
  }
}

@media screen and (max-width: 1439px) {
  .about-page {
    padding-bottom: 60px;
  }
  /* 移动端：底部横向导航 */
  .about-nav {
    display: flex;
    position: fixed;
    right: unset;
    left: 0;
    top: unset;
    bottom: 0;
    transform: none;
    width: 100%;
    justify-content: center;
    padding: 12px 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
  }
  .about-nav-track {
    flex-direction: row;
    gap: 20px;
    &::before {
      display: none;
    }
  }
  .about-nav-label {
    display: none;
  }
  .about-nav-dot {
    width: 10px;
    height: 10px;
  }
}
</style>
