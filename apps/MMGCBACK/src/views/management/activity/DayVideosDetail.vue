<template>
  <PageWrapper title="天数作品详情" content="管理视频作品" contentBackground @back="$router.back()">
    <div class="p-4">
      <p class="text-2xl">目前已有视频作品 {{ movieData?.total }}</p>
      <div class="w-96 flex">
        <SelectRemoteData
          :customApi="getMovieList"
          :customKey="customKey"
          v-model:value="cuurentMovieId"
          placeholder="请选择你想添加的作品"
          :selected="movieData?.result.map((item) => item.movieId)"
        />
        <a-button @click="addMovieToDay">添加</a-button>
      </div>
      <VueDraggable
        v-if="movieData && movieData.result"
        v-model="movieData.result"
        animation="200"
        @end="sortMovieFn"
        item-key="movieId"
        class="video-grid"
      >
        <template #item="{ element: item }">
          <MovieItem size="box" :movieItem="item" @clear-day="getMovieListFn" />
        </template>
      </VueDraggable>
    </div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { computed, ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { getMovieList, updateMovie, sortMovie } from '/@/api/movie/movie'
  import { PageWrapper } from '/@/components/Page'
  import { useMessage } from '/@/hooks/web/useMessage'
  import MovieItem from '../movie/components/MovieItem.vue'
  import { MovieVo } from '/@/api/movie/model/movieEntity'
  import { SelectRemoteData } from '/@/components/SelectRemoteData'
  import VueDraggable from 'vuedraggable'
  const route = useRoute()

  const cuurentMovieId = ref()

  const customKey = {
    value: 'movieId',
    label: 'movieName.cn',
    image: 'movieCover',
  }

  const activityId = computed(() => {
    return parseInt(route.params.id.toString())
  })

  const day = computed(() => {
    return parseInt(route.params.day.toString())
  })

  const movieData = ref<PageResult<MovieVo>>()

  const { createMessage } = useMessage()

  const addMovieToDay = async () => {
    console.log(cuurentMovieId.value)

    if (!cuurentMovieId.value) return
    await updateMovie({
      movieId: cuurentMovieId.value,
      day: day.value,
      activityId: activityId.value,
    })
    createMessage.success('更新成功')
    getMovieListFn()
  }

  const getMovieListFn = async () => {
    const { data } = await getMovieList({
      activityId: activityId.value,
      day: day.value,
    })
    data.result = data.result.sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))
    movieData.value = data
  }

  const sortMovieFn = async () => {
    const list =
      (movieData.value &&
        movieData.value.result.map((item, index) => {
          return {
            movieId: item.movieId,
            sortIndex: index,
          }
        })) ||
      []
    await sortMovie(list)
    getMovieListFn()
  }

  onMounted(() => {
    getMovieListFn()
  })
</script>

<style lang="less" scoped>
  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding: 8px 0;
  }
</style>
