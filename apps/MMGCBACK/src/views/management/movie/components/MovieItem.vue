<template>
  <div
    class="box flex-col sm:flex-row"
    @click="go(`/management/movie/${movieItem.movieId}`)"
    v-if="size === 'list'"
  >
    <div class="flex-shrink-0 overflow-hidden w-full sm:w-auto flex justify-center sm:block">
      <Image :src="movieItem.movieCover" :width="300" :preview="false" class="max-w-full" />
    </div>
    <div class="flex-1 flex flex-col px-4 py-3 justify-between">
      <div>
        <div class="mb-2 flex flex-wrap items-center">
          <p class="font-bold text-xl sm:text-2xl m-0 mr-2">{{ movieItem.movieName.cn }}</p>
          <div class="flex flex-wrap gap-1 mt-1 sm:mt-0">
            <Tag color="#040500" v-if="movieItem.isActivityMovie">MMGC-黄金祭专属</Tag>
            <Tag color="#f50" v-if="movieItem.isOrigin">原创作品</Tag>
            <Tag color="#005ED6" v-if="movieItem.isPublic">已公开作品</Tag>
            <Tag color="#666666" v-if="!movieItem.isPublic">未公开作品</Tag>
          </div>
        </div>
        <p class="text-xs text-gray-400 mb-1" v-if="movieItem.movieName.jp">
          日文名:{{ movieItem.movieName.jp }}
        </p>
        <p class="text-xs text-gray-400 mb-1" v-if="movieItem.movieName.en">
          英文名:{{ movieItem.movieName.en }}
        </p>
        <p class="break-all">简介:{{ movieItem.movieDesc.cn }}</p>
      </div>
      <div class="flex flex-wrap text-xs text-gray-600 items-center gap-x-4 gap-y-2 mt-2">
        <div class="flex items-center">
          <span class="mr-1">上传者:</span>
          <MemberPopover :userInfo="movieItem.uploader" />
        </div>
        <div class="flex items-center">
          <span class="mr-1">原作者:</span>
          <MemberPopover :userInfo="movieItem.author" v-if="movieItem.author" />
          <p v-else class="m-0">{{ movieItem.authorName }}</p>
        </div>
        <div class="flex items-center gap-1">
          <Icon icon="ant-design:like-outlined" class="text-light-500" />
          <span>{{ movieItem.likeNums }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon icon="ant-design:comment-outlined" class="text-light-500" />
          <span>{{ movieItem.commentNums }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon icon="ant-design:profile-outlined" class="text-light-500" />
          <span>{{ movieItem.pollNums }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon icon="ant-design:eye-outlined" class="text-light-500" />
          <span>{{ movieItem.viewNums }}</span>
        </div>
        <div class="hidden sm:block">
          上传时间:
          <span>{{ movieItem.createTime }}</span>
        </div>
      </div>
    </div>
    <div class="px-4 py-2 sm:p-0 flex justify-end items-center sm:pr-4">
      <Popconfirm
        title="删除视频后将无法恢复！确定？"
        ok-text="确认"
        cancel-text="取消"
        @confirm="confirmDelete"
        @click.stop=""
      >
        <a-button color="error" class="sm:mt-2">删除视频</a-button>
      </Popconfirm>
    </div>
  </div>
  <div v-else class="box2" @click="go(`/management/movie/${movieItem.movieId}`)">
    <div class="flex-shrink-0 overflow-hidden w-full" style="max-height: 180px">
      <Image
        :src="movieItem.movieCover"
        :preview="false"
        class="w-full"
        style="object-fit: cover"
      />
    </div>
    <div class="flex-1 flex flex-col px-4 py-1 justify-between">
      <div class="clearday" @click.stop="clearDay">
        <Icon icon="ant-design:close-circle-filled" :size="24" />
      </div>
      <div>
        <div class="mb-1 flex items-center">
          <p class="font-bold text-xl m-0 mr-2">{{ movieItem.movieName.cn }}</p>
        </div>
        <p class="text-xs text-gray-400 mb-1" v-if="movieItem.movieName.jp">
          日文名:{{ movieItem.movieName.jp }}
        </p>
        <p class="text-xs text-gray-400 mb-1" v-if="movieItem.movieName.en">
          英文名:{{ movieItem.movieName.en }}
        </p>
        <p class="break-all maxline">简介:{{ movieItem.movieDesc.cn }}</p>
      </div>
      <div class="flex text-xs text-gray-600 items-center">
        <div class="mr-2">
          上传者:
          <MemberPopover :userInfo="movieItem.uploader" />
        </div>
        <div class="mx-2">
          原作者:
          <MemberPopover :userInfo="movieItem.author" v-if="movieItem.author" />
          <p v-else>{{ movieItem.authorName }}</p>
        </div>
      </div>
      <div class="flex text-xs text-gray-600 items-center">
        <div>
          <Icon icon="ant-design:like-outlined" class="text-light-500" />
          <span>{{ movieItem.likeNums }}</span>
        </div>
        <div class="mx-2">
          <Icon icon="ant-design:comment-outlined" class="text-light-500" />
          <span>{{ movieItem.commentNums }}</span>
        </div>
        <div class="mx-2">
          <Icon icon="ant-design:profile-outlined" class="text-light-500" />
          <span>{{ movieItem.pollNums }}</span>
        </div>
        <div class="mx-2">
          <Icon icon="ant-design:eye-outlined" class="text-light-500" />
          <span>{{ movieItem.viewNums }}</span>
        </div>
      </div>
      <div class="flex text-xs text-gray-600 items-center">
        <div>
          上传时间:
          <span>{{ movieItem.createTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { Image, Tag, Popconfirm } from 'ant-design-vue'
  import { MovieVo } from '/@/api/movie/model/movieEntity'
  import { MemberPopover } from '/@/components/MemberPopover'
  import { Icon } from '/@/components/Icon'
  import { useGo } from '/@/hooks/web/usePage'
  import { updateMovie } from '/@/api/movie/movie'

  const go = useGo()
  const props = withDefaults(
    defineProps<{
      movieItem: MovieVo
      size?: 'box' | 'list'
    }>(),
    {
      size: 'list',
    },
  )

  const emit = defineEmits(['confirmDelete', 'clearDay'])

  const clearDay = async () => {
    await updateMovie({
      movieId: props.movieItem.movieId,
      day: -1,
    })
    emit('clearDay')
  }

  const confirmDelete = () => {
    emit('confirmDelete')
  }
</script>

<style lang="less" scoped>
  .box {
    display: flex;
    justify-content: space-between;
    margin: 8px;
    border: 1px solid rgb(240, 157, 157);
    background-color: white;
    overflow: hidden;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.4s ease;

    @media (max-width: 640px) {
      margin: 8px 0;
      border-radius: 0;
      border-left: none;
      border-right: none;
    }

    &:hover {
      transform: translateY(-10px);
      overflow: auto;
      box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
    }
  }

  .maxline {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5; /* 限制为五行 */
    overflow: hidden;
  }

  .box2 {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    position: relative;
    border-radius: 5px;
    border: 1px solid rgb(240, 157, 157);
    cursor: pointer;
    background-color: white;
    min-width: 280px;
    min-height: 360px;
    overflow: hidden;
    transition: all 0.4s ease;

    &:hover {
      transform: translateY(-10px);
      overflow: auto;
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.4);
    }

    .clearday {
      position: absolute;
      width: 30px;
      height: 30px;
      top: 0;
      right: 0;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(1, 40, 75, 0.199);
    }
  }
</style>
