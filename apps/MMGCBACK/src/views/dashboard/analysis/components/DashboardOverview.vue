<template>
  <Row :gutter="[16, 16]" class="dashboard-overview">
    <Col :xs="24" :sm="12" :xl="6">
      <Card class="overview-card" :loading="loading" :bordered="false">
        <Statistic title="R2 当前存储" :value="overview.currentStorageGB" :precision="4" suffix="GB" />
        <div class="overview-meta">
          <span>7 天日均 {{ formatNumber(overview.avgStorageGB, 4) }} GB</span>
          <span>{{ overview.objectCount.toLocaleString() }} 个对象</span>
        </div>
      </Card>
    </Col>
    <Col :xs="24" :sm="12" :xl="6">
      <Card class="overview-card" :loading="loading" :bordered="false">
        <Statistic title="Class A 操作 (7天)" :value="overview.classAOperations" />
        <div class="overview-meta">
          <span>写入、列举等</span>
        </div>
        <div class="overview-tip">每月 100 万次免费</div>
      </Card>
    </Col>
    <Col :xs="24" :sm="12" :xl="6">
      <Card class="overview-card" :loading="loading" :bordered="false">
        <Statistic title="Class B 操作 (7天)" :value="overview.classBOperations" />
        <div class="overview-tip">读取、Head 等；每月 1000 万次免费</div>
      </Card>
    </Col>
    <Col :xs="24" :sm="12" :xl="6">
      <Card class="overview-card" :loading="loading" :bordered="false">
        <Statistic title="R2 预估费用 (7天)" :value="overview.estimatedTotalCostUSD" :precision="4" prefix="$" suffix="USD" />
        <div class="overview-tip">Standard Storage；公网出口流量费 $0</div>
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
    provider: 'cloudflare-r2',
    configured: false,
    configurationError: null,
    bucket: '',
    periodDays: 7,
    currentStorageGB: 0,
    avgStorageGB: 0,
    objectCount: 0,
    classAOperations: 0,
    classBOperations: 0,
    otherOperations: 0,
    totalOperations: 0,
    estimatedStorageCostUSD: 0,
    estimatedOperationsCostUSD: 0,
    estimatedTotalCostUSD: 0,
  }

  const loading = ref(false)
  const overview = ref<DashboardOverviewData>({ ...emptyOverview })

  function formatNumber(value: number, precision = 2) {
    return value.toFixed(precision)
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
