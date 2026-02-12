<template>
  <Spin :spinning="isLoading">
    <VueDraggable
      v-model="dayList"
      animation="200"
      @end="sortDays"
      item-key="_id"
      v-if="dayList && dayList.length > 0"
    >
      <template #item="{ element: item }">
        <div class="day-item" :key="item.day" title="可以拖拽修改顺序哦">
          <div class="day"></div>
          <div class="w-72 h-full" v-if="item.themeCover">
            <Image :src="item.themeCover || ''" />
          </div>
          <div class="desc flex-1">
            <p class="text-2xl">
              {{ item.themeName?.cn }}
              <Tag v-if="item.isPublic" color="#ccc">已公开</Tag>
              <Tag v-else color="#bbb">未公开</Tag>
            </p>
            <p>{{ item.themeDesc?.cn }}</p>
            <div class="movie-titles" v-if="dayMovies[item.day || 0]">
              <Tag v-for="movie in dayMovies[item.day || 0]" :key="movie.movieId" color="blue">
                {{ movie.movieName?.cn }}
              </Tag>
            </div>
          </div>
          <div class="buttons">
            <a-button
              class="mr-2"
              @click="$router.push(`/management/activity/${activityId}/${item.day}`)"
            >
              管理作品
            </a-button>
            <a-button color="success" class="mr-2" @click="openUpdate(item)">编辑</a-button>
            <a-button color="danger" class="mr-2" @click="deleteOne(item)">删除</a-button>
          </div>
        </div>
      </template>
    </VueDraggable>

    <div class="add-day" @click="handleAdd">
      <Icon icon="ant-design:plus-circle-outlined" :size="72" class="my-4" />
      <p>点此添加一个新的天数吧~</p>
    </div>
    <AddDayModal
      @register="registerModal"
      @success="getAllDays"
      :activityId="activityId"
      :isUpdate="isUpdate"
      :item="currentItem"
    />
  </Spin>
</template>
<script setup lang="ts">
  import VueDraggable from 'vuedraggable'
  import { Image, Spin, Tag } from 'ant-design-vue'
  import { Icon } from '/@/components/Icon'
  import { onMounted, ref } from 'vue'
  import { useModal } from '/@/components/Modal'
  import { deleteDay, getDays, sortDay } from '/@/api/activity/activity'
  import { getMovieList } from '/@/api/movie/movie'
  import AddDayModal from './AddDayModal.vue'
  import { DayVo } from '/@/api/activity/model/activityEntity'
  import { MovieVo } from '/@/api/movie/model/movieEntity'
  const isLoading = ref(false)
  const isUpdate = ref(false)
  const dayList = ref<DayVo[]>([])
  const dayMovies = ref<Record<number, MovieVo[]>>({})
  const currentItem = ref<DayVo>()
  const [registerModal, { openModal }] = useModal()

  const props = defineProps<{
    activityId: number
  }>()

  const handleAdd = (record: Recordable) => {
    isUpdate.value = false
    openModal(true, {
      record,
      isUpdate: true,
    })
  }

  const openUpdate = (item: DayVo) => {
    isUpdate.value = true
    currentItem.value = item
    openModal(true, {
      isUpdate: true,
    })
  }

  const getAllDays = async () => {
    const { data } = await getDays(props.activityId)
    dayList.value = []
    setTimeout(() => {
      dayList.value = data.sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))
    }, 0)
    fetchDayMovies()
  }

  const fetchDayMovies = async () => {
    const { data } = await getMovieList({
      activityId: props.activityId,
      pageSize: 1000,
    })
    const groups: Record<number, MovieVo[]> = {}
    data.result.forEach((movie) => {
      if (movie.day !== null) {
        if (!groups[movie.day]) {
          groups[movie.day] = []
        }
        groups[movie.day].push(movie)
      }
    })
    dayMovies.value = groups
  }

  const sortDays = async () => {
    const arr = dayList.value.map((item, index) => {
      return {
        id: item.day || 0,
        sortIndex: index,
        activityId: item.activityId,
      }
    })
    await sortDay(arr)
    await getAllDays()
  }

  const deleteOne = async (item: DayVo) => {
    await deleteDay({
      activityId: item.activityId || 0,
      day: item.day || 0,
    })
    getAllDays()
  }

  onMounted(() => {
    getAllDays()
  })
</script>

<style lang="less" scoped>
  .day-item {
    width: 100%;
    height: 150px;
    border-radius: 12px;
    background-color: #fff;
    overflow: hidden;
    margin: 5px 0;
    border: 3px solid rgb(101, 193, 255);
    display: flex;
    justify-content: flex-start;

    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    &:hover {
      border-color: #2db7f5;
    }

    .day {
      padding: 0 5px;
      color: #fff;
      font-size: 48px;
      width: 10px;
      word-break: break-all;
      line-height: 40px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(10, 88, 190, 0.822);
    }

    .buttons {
      justify-self: flex-end;
      margin-top: 2px;
    }

    .desc {
      padding: 10px;

      .movie-titles {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }
  }

  .add-day {
    width: 100%;
    height: 150px;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    cursor: pointer;
    border-radius: 12px;
    border: 3px solid rgb(101, 193, 255);
    background-color: rgb(206, 206, 206);
    color: rgb(59, 59, 59);
    transition: all 0.4s ease;

    &:hover {
      background-color: #fff;
      color: rgb(0, 71, 153);
      box-shadow: 0 0 5px rgba(25, 130, 250, 0.4);
    }
  }
</style>
