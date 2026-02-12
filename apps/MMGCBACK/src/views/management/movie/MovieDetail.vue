<template>
  <PageWrapper
    :title="`视频 ${movieData?.movieName.cn || '未知'} 详细信息`"
    content="编辑视频详情"
    contentBackground
    @back="$router.back()"
  >
    <template #extra>
      <a-button type="primary" @click="isEdit = true" v-if="!isEdit">修改信息</a-button>
      <a-button type="primary" color="success" v-if="isEdit" @click="updateMovieFn">完成</a-button>
      <a-button @click="isEdit = false" v-if="isEdit">取消</a-button>
      <a-button type="primary" danger @click="deleteMovieFn">删除视频</a-button>
    </template>
    <div class="m-4 desc-wrap">
      <BasicForm @register="register">
        <template #moviePlaylink>
          <MovieUpload
            :video-params="videoParams"
            :source="source"
            :disabled="!isEdit"
            @change-video-params="changeVideo"
          />
        </template>
        <template #movieCover="{ model, field }">
          <UploadImg :disabled="!isEdit" @change-img="changeImg" :online-img="model[field]" />
        </template>
        <template #movieNameTranslate="{ model }">
          <AutoTranslate
            :source-text="model['movieName.cn']"
            @done="(r) => setFieldsValue({ 'movieName.en': r.en, 'movieName.jp': r.jp })"
          />
        </template>
        <template #movieDescTranslate="{ model }">
          <AutoTranslate
            :source-text="model['movieDesc.cn']"
            @done="(r) => setFieldsValue({ 'movieDesc.en': r.en, 'movieDesc.jp': r.jp })"
          />
        </template>
        <template #authorId="{ model, field }">
          <MemberPopover />
          <SelectRemoteData
            v-model:value="model[field]"
            :custom-key="customMemberKey"
            :custom-api="getUserList"
            placeholder="请选择原作者"
            :disabled="!isEdit"
          />
        </template>
        <template #activityId="{ model, field }">
          <SelectRemoteData
            v-model:value="model[field]"
            :custom-key="customActivityKey"
            :custom-api="getActivityList"
            :disabled="!isEdit"
          />
        </template>
        <template #day="{ model, field }">
          <SelectRemoteData
            v-model:value="model[field]"
            :custom-key="customDayKey"
            :custom-api="getDays"
            :disabled="!isEdit || !model['activityId']"
            :need-page="false"
            :custom-params="model['activityId']"
          />
        </template>
      </BasicForm>
      <Description title="详细信息" :column="3" :data="movieData" :schema="schema" />
    </div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { computed, onMounted, ref, watchEffect } from 'vue'
  import { useRoute } from 'vue-router'
  import { MovieVo } from '/@/api/movie/model/movieEntity'
  import { deleteMovie, getMovieDetail, updateMovie } from '/@/api/movie/movie'
  import { BasicForm, useForm } from '/@/components/Form'
  import { PageWrapper } from '/@/components/Page'
  import { useVideoI18n, useSelectRemote, useMovieDetail } from '/@/hooks/custom/useMovie'
  import { useGo } from '/@/hooks/web/usePage'
  import { SelectRemoteData } from '/@/components/SelectRemoteData'
  import { AutoTranslate } from '/@/components/AutoTranslate'
  import { updateSchemas } from '/@/views/form/movie/useMovie'
  import { MemberPopover } from '/@/components/MemberPopover'
  import { Description } from '/@/components/Description/index'
  import MovieUpload from '/@/components/MovieUpload/MovieUpload.vue'
  import UploadImg from '/@/components/UploadImg/UploadImg.vue'
  import { useMessage } from '/@/hooks/web/useMessage'

  const go = useGo()
  const route = useRoute()
  const movieData = ref<MovieVo>()
  const isEdit = ref<Boolean>(false)
  const [register, { validate, setFieldsValue, setProps, getFieldsValue }] = useForm({
    labelWidth: 120,
    labelAlign: 'left',
    schemas: updateSchemas,
    actionColOptions: {
      span: 24,
    },
    showResetButton: false,
    showSubmitButton: false,
    disabled: !isEdit.value,
  })

  const { videoParams, source, changeVideo } = useVideoI18n(setFieldsValue)
  const {
    customMemberKey,
    customActivityKey,
    customDayKey,
    getActivityList,
    getUserList,
    getDays,
  } = useSelectRemote()
  const { schema } = useMovieDetail()
  const movieId = computed(() => {
    return parseInt(route.params.id.toString())
  })
  const { createMessage } = useMessage()
  const goBack = () => {
    go('/management/movie')
  }

  const changeImg = (val) => {
    setFieldsValue({ movieCover: val })
  }

  const getMovieDetailFn = async (movieId: number) => {
    const { data } = await getMovieDetail(movieId)
    movieData.value = data
    setFieldsValue(movieData.value)
    setFieldsValue({
      authorId: movieData.value.author ? movieData.value.author.memberId : undefined,
      uploader: movieData.value.uploader.memberId,
      activityId: movieData.value.activityVo ? movieData.value.activityVo.activityId : undefined,
    })
    for (const key in videoParams) {
      videoParams[key] = movieData.value.moviePlaylink[key]
    }
  }

  const updateMovieFn = async () => {
    try {
      await validate()
      if (!videoParams.cn) {
        createMessage.error('请上传中文(默认)版视频')
        return
      }
      const values = getFieldsValue()
      for (const key in values) {
        if (typeof values[key] === 'string' && !isNaN(Number(values[key]))) {
          values[key] = Number(values[key])
        }
      }
      values.movieId = movieId.value
      await updateMovie(values as any)
      createMessage.success('更新成功')
      await getMovieDetailFn(movieId.value)
      isEdit.value = false
      setProps({ disabled: !isEdit.value })
    } catch (error) {}
  }

  watchEffect(() => {
    if (!isEdit.value) {
      setFieldsValue(movieData.value)
    }
    setProps({ disabled: !isEdit.value })
  })

  const deleteMovieFn = async () => {
    await deleteMovie(movieId.value)
    createMessage.success('删除成功')
    goBack()
  }

  onMounted(() => {
    getMovieDetailFn(movieId.value)
  })
</script>
