<template>
  <PageWrapper title="视频列表">
    <template #headerContent>
      <div class="flex flex-wrap gap-4 items-end">
        <FormItem label="关键词" class="mb-0 w-full sm:w-auto">
          <a-input v-model:value="params.keyword" allowClear />
        </FormItem>
        <FormItem label="选择活动" class="mb-0 w-full sm:w-80">
          <SelectRemoteData
            v-model:value="params.activityId"
            :custom-key="customActivityKey"
            :custom-api="getActivityList"
          />
        </FormItem>
        <FormItem label="是否公开" class="mb-0">
          <RadioGroup v-model:value="params.isPublic">
            <Radio :value="undefined">全部</Radio>
            <Radio :value="0">未公开</Radio>
            <Radio :value="1">已公开</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="排序规则" class="mb-0">
          <RadioGroup v-model:value="params.sortRule">
            <Radio :value="undefined">默认</Radio>
            <Radio value="reverse">时间倒序</Radio>
          </RadioGroup>
        </FormItem>
      </div>
    </template>
    <div class="list">
      <p class="text-gray-400">查询到：{{ movieListData.total }}条数据</p>
      <Spin :spinning="isLoading">
        <div v-if="movieListData.result.length > 0">
          <MovieItem
            v-for="item in movieListData.result"
            :key="item.movieId"
            :movieItem="item"
            @confirm-delete="() => deleteMovieFn(item.movieId)"
          />
        </div>
        <Empty v-else />
      </Spin>
      <Pagination
        show-size-changer
        v-model:current="params.page"
        v-model:pageSize="params.pageSize"
        :total="movieListData.total"
        @show-size-change="onShowSizeChange"
      />
    </div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, watch, ref } from 'vue'
  import { Pagination, Spin, Empty, FormItem, RadioGroup, Radio } from 'ant-design-vue'
  import { PageWrapper } from '/@/components/Page'
  import { getMovieList, deleteMovie } from '/@/api/movie/movie'
  import { getActivityList } from '/@/api/activity/activity'
  import { SelectRemoteData } from '/@/components/SelectRemoteData'
  import { useMessage } from '/@/hooks/web/useMessage'
  import MovieItem from './components/MovieItem.vue'
  import { MoviePageParams, MovieVo } from '/@/api/movie/model/movieEntity'
  import { debounce } from 'lodash-es'

  const { createMessage } = useMessage()

  let params = reactive<MoviePageParams>({
    page: 1,
    pageSize: 10,
    keyword: undefined,
    activityId: undefined,
    isPublic: undefined,
    sortRule: undefined,
  })
  const isLoading = ref(false)

  const onShowSizeChange = (current: number, pageSize: number) => {
    params.page = current
    params.pageSize = pageSize
  }

  const customActivityKey = {
    value: 'activityId',
    label: 'activityName.cn',
    image: 'activityCover',
  }

  const movieListData = reactive<PageResult<MovieVo>>({
    page: 0,
    total: 0,
    result: [],
  })

  const getList = async (params: MoviePageParams) => {
    isLoading.value = true
    try {
      const { data } = await getMovieList(params)
      movieListData.result = data.result
      movieListData.page = data.page
      movieListData.total = data.total
    } finally {
      isLoading.value = false
    }
  }

  const deleteMovieFn = async (movieId: number) => {
    try {
      await deleteMovie(movieId)
      createMessage.success('删除成功')
    } finally {
      getList(params)
    }
  }

  const debouncedGetList = debounce(getList, 300)
  watch(params, (val) => {
    debouncedGetList(val)
  })

  onMounted(() => {
    getList(params)
  })
</script>
