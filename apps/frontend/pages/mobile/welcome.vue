<template>
  <div class="welcome-container">
    <div class="content flex-col px-4">
      <div v-if="activityData" class="logo-wrapper mb-8">
        <MyCustomImage :img="activityData.activityLogo" class="full-logo" />
      </div>
      <ElButton
        v-if="activityData"
        type="primary"
        round
        size="large"
        class="enter-btn px-10 py-5 text-lg"
        @click="enterActivity"
      >
        {{ $t('enterDetail') }}
      </ElButton>
      <div v-if="isLoading" class="mt-4">
        <Icon name="svg-spinners:ring-resize" size="40" class="text-white" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '~~/stores/global'

const localeRoute = useLocaleRoute()
const globalState = useGlobalStore()
const currentActivityId = computed(() => globalState.config?.currentActivityId || 0)
const { activityData, isLoading } = useActivityDetail(currentActivityId.value)

const enterActivity = () => {
  if (activityData.value?.activityId) {
    const route = localeRoute(`/mobile/activity/${activityData.value.activityId}/about`)
    if (route?.fullPath) {
      navigateTo(route.fullPath)
    }
  }
}
</script>

<style lang="scss" scoped>
.welcome-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(@/assets/2024/newbg.jpg);
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  width: 100%;
}

.logo-wrapper {
  width: 90%;
  max-width: 400px;
  animation: fadeInDown 1.2s ease-out;

  .full-logo {
    width: 100%;
    height: auto;
    filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.5));
  }
}

.enter-btn {
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  animation: fadeInUp 1.2s ease-out;

  &:active {
    transform: scale(0.95);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
