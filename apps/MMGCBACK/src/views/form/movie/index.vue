<template>
  <PageWrapper
    title="视频投稿"
    contentBackground
    content=" 投稿一个MAD，这个MAD既可以作为活动作品，也可以作为日常作品哦"
    contentClass="p-4"
  >
    <div class="step-form-form">
      <Steps :current="current">
        <Step title="填写视频基本信息" />
        <Step title="上传视频" />
        <Step title="填写关联信息" />
      </Steps>
    </div>
    <Spin :spinning="isLoading">
      <div class="mt-5" v-if="!isSuccess">
        <Step1 @next="next" v-show="current === 0" />
        <Step2 @prev="prev" @next="next" v-show="current === 1" />
        <Step3 v-show="current === 2" v-if="current === 2" @end="submit" @prev="prev" />
      </div>
      <div v-else>
        <Result
          status="success"
          title="投稿成功，请去列表查看"
          subTitle="您的投稿如果超过了期望公开时间，那么将会立即公开，你可以随时编辑他"
        >
          <template #extra>
            <a-button key="console" type="primary">查看视频列表</a-button>
            <a-button key="buy" @click="continueEdit">继续投稿</a-button>
          </template>
        </Result>
      </div>
    </Spin>
  </PageWrapper>
</template>
<script lang="ts">
  export default {
    name: 'FormStepPage',
  }
</script>

<script lang="ts" setup>
  import { reactive, ref } from 'vue'
  import Step1 from './components/Step1.vue'
  import Step2 from './components/Step2.vue'
  import Step3 from './components/Step3.vue'
  import { PageWrapper } from '/@/components/Page'
  import { Steps, Step, Spin, Result } from 'ant-design-vue'
  import _ from 'lodash-es'
  import { MovieParams } from '/@/api/movie/model/movieEntity'
  import { save } from '/@/api/movie/movie'

  const current = ref(0)

  const isLoading = ref(false)

  const isSuccess = ref(false)

  let form = reactive<Partial<MovieParams>>({})

  const next = (val: any) => {
    current.value++
    form = _.assignIn(form, val)
  }

  const prev = () => {
    current.value--
  }

  const submit = async (val: any) => {
    form = _.assignIn(form, val)
    isLoading.value = true
    try {
      await save(form as MovieParams)
      isSuccess.value = true
      isLoading.value = false
    } finally {
      isLoading.value = false
    }
  }

  const continueEdit = () => {
    isSuccess.value = false
    current.value = 0
  }
</script>
<style lang="less" scoped>
  .step-form-content {
    padding: 24px;
    background-color: @component-background;
  }

  .step-form-form {
    width: 750px;
    margin: 0 auto;
  }
</style>
