<template>
  <div ref="chartRef" :style="{ height, width }"></div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref, Ref } from 'vue'
  import { useECharts } from '/@/hooks/web/useECharts'
  import { getSiteTrafficStats } from '/@/api/statistics/statistics'

  export default defineComponent({
    name: 'SiteTrafficStat',
    props: {
      width: {
        type: String,
        default: '100%',
      },
      height: {
        type: String,
        default: '300px',
      },
      title: {
        type: String,
        default: '网站7日流量与访问量统计',
      },
    },
    setup(props) {
      const chartRef = ref<HTMLDivElement | null>(null)
      const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>)

      onMounted(async () => {
        try {
          const res = await getSiteTrafficStats(7)
          if (!res || res.length === 0) return

          const dates = res.map((item) => item.date)
          const uvData = res.map((item) => item.dayUv)
          const fluxData = res.map((item) => item.fluxGB)
          const chinaFluxData = res.map((item) => item.chinaFluxGB)
          const overseaFluxData = res.map((item) => item.overseaFluxGB)

          setOptions({
            title: {
              text: props.title,
              left: 'center',
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
              },
            },
            legend: {
              data: ['独立访客(UV)', 'CDN流量(GB)', '国内流量(GB)', '海外流量(GB)'],
              bottom: 0,
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '14%',
              containLabel: true,
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: dates,
            },
            yAxis: [
              {
                type: 'value',
                name: '访问量(UV)',
                position: 'left',
              },
              {
                type: 'value',
                name: '流量 (GB)',
                position: 'right',
                splitLine: {
                  show: false,
                },
              },
            ],
            series: [
              {
                name: '独立访客(UV)',
                type: 'line',
                smooth: true,
                yAxisIndex: 0,
                areaStyle: {
                  color: 'rgba(90, 177, 239, 0.2)',
                },
                itemStyle: {
                  color: '#5ab1ef',
                },
                data: uvData,
              },
              {
                name: 'CDN流量(GB)',
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                areaStyle: {
                  color: 'rgba(1, 150, 128, 0.16)',
                },
                itemStyle: {
                  color: '#019680',
                },
                data: fluxData,
              },
              {
                name: '国内流量(GB)',
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                itemStyle: {
                  color: '#f6bd16',
                },
                data: chinaFluxData,
              },
              {
                name: '海外流量(GB)',
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                itemStyle: {
                  color: '#7262fd',
                },
                data: overseaFluxData,
              },
            ],
          })
        } catch (error) {
          console.error('Failed to load site traffic stats', error)
        }
      })

      return {
        chartRef,
      }
    },
  })
</script>
