<template>
  <div class="p-4">
    <p class="text-lg font-bold mb-4">欢迎来到mmgc管理后台</p>
    <div class="md:w-1/2 w-full bg-white p-4 rounded-md shadow-sm">
      <SiteTrafficStat />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import SiteTrafficStat from './components/SiteTrafficStat.vue'
</script>
