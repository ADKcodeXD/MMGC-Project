<template>
  <Row :gutter="[16, 16]" class="dashboard-overview">
    <Col :xs="24" :sm="12" :xl="6">
      <Card class="overview-card" :loading="loading" :bordered="false">
        <Statistic title="CDN 流量总计 (7天)" :value="overview.totalTrafficGB" :precision="2" suffix="GB" />
        <div class="overview-meta">
          <span>国内 {{ formatNumber(overview.chinaTrafficGB) }} GB</span>
          <span>海外 {{ formatNumber(overview.overseaTrafficGB) }} GB</span>
        </div>
      </Card>
    </Col>
    <Col :xs="24" :sm="12" :xl="6">
      <Card class="overview-card" :loading="loading" :bordered="false">
        <Statistic title="预估流量费用" :value="overview.estimatedTrafficCost" :precision="2" prefix="￥" />
        <div class="overview-meta">
          <span>国内 ￥{{ formatNumber(overview.estimatedChinaTrafficCost) }}</span>
          <span>海外 ￥{{ formatNumber(overview.estimatedOverseaTrafficCost) }}</span>
        </div>
        <div class="overview-tip">按 ￥0.15/GB 估算</div>
      </Card>
    </Col>
    <Col :xs="24" :sm="12" :xl="6">
      <Card class="overview-card" :loading="loading" :bordered="false">
        <Statistic title="七牛云当前存储" :value="overview.currentStorageGB" :precision="2" suffix="GB" />
        <div class="overview-tip">标准存储空间</div>
      </Card>
    </Col>
    <Col :xs="24" :sm="12" :xl="6">
      <Card class="overview-card" :loading="loading" :bordered="false">
        <Statistic title="预估存储月费" :value="overview.estimatedStorageCost" :precision="2" prefix="￥" />
        <div class="overview-tip">按 ￥0.10/GB/月 估算</div>
      </Card>
    </Col>
  </Row>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { Card, Col, Row, Statistic } from 'ant-design-vue'
  import { getDashboardOverview } from '/@/api/statistics/statistics'
  import type { DashboardOverviewData } from '/@/api/statistics/statistics'

  const emptyOverview: DashboardOverviewData = {
    totalTrafficGB: 0,
    chinaTrafficGB: 0,
    overseaTrafficGB: 0,
    estimatedTrafficCost: 0,
    estimatedChinaTrafficCost: 0,
    estimatedOverseaTrafficCost: 0,
    currentStorageGB: 0,
    estimatedStorageCost: 0,
  }

  const loading = ref(false)
  const overview = ref<DashboardOverviewData>({ ...emptyOverview })

  function formatNumber(value: number) {
    return value.toFixed(2)
  }

  onMounted(async () => {
    loading.value = true
    try {
      overview.value = await getDashboardOverview(7)
    } catch (error) {
      console.error('Failed to load dashboard overview', error)
      overview.value = { ...emptyOverview }
    } finally {
      loading.value = false
    }
  })
</script>

<style lang="less" scoped>
  .dashboard-overview {
    margin-bottom: 16px;
  }

  .overview-card {
    min-height: 156px;
    background: #fff;
    box-shadow: 0 2px 10px rgb(0 0 0 / 5%);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
    }
  }

  .overview-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    margin-top: 12px;
    color: #595959;
    font-size: 12px;
    line-height: 20px;
  }

  .overview-tip {
    margin-top: 12px;
    color: #8c8c8c;
    font-size: 12px;
    line-height: 20px;
  }
</style>
