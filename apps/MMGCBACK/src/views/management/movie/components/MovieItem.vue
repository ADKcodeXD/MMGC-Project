<template>
  <!-- List/Default Size (Now a vertical card for Grid layout) -->
  <div
    class="group relative bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
    @click="go(`/management/movie/${movieItem.movieId}`)"
    v-if="size === 'list'"
  >
    <!-- Cover Image -->
    <div class="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-dark-900">
      <img :src="movieItem.movieCover" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div class="absolute top-2 left-2 flex flex-col gap-1">
        <Tag color="#040500" v-if="movieItem.isActivityMovie" class="!m-0">MMGC专属</Tag>
        <Tag color="#f50" v-if="movieItem.isOrigin" class="!m-0">原创</Tag>
        <Tag color="#005ED6" v-if="movieItem.isPublic" class="!m-0">已公开</Tag>
        <Tag color="#666666" v-if="!movieItem.isPublic" class="!m-0">未公开</Tag>
      </div>
    </div>
    
    <!-- Content -->
    <div class="p-3 sm:p-4 flex-1 flex flex-col">
      <h3 class="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
        {{ movieItem.movieName.cn }}
      </h3>
      
      <p class="text-xs text-gray-400 mb-2 line-clamp-1" v-if="movieItem.movieName.jp || movieItem.movieName.en">
        {{ movieItem.movieName.jp || movieItem.movieName.en }}
      </p>
      
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
        {{ movieItem.movieDesc.cn }}
      </p>
      
      <!-- Stats -->
      <div class="flex flex-wrap gap-x-3 gap-y-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
        <div class="flex items-center gap-1"><Icon icon="ant-design:like-outlined" /><span>{{ movieItem.likeNums }}</span></div>
        <div class="flex items-center gap-1"><Icon icon="ant-design:comment-outlined" /><span>{{ movieItem.commentNums }}</span></div>
        <div class="flex items-center gap-1"><Icon icon="ant-design:profile-outlined" /><span>{{ movieItem.pollNums }}</span></div>
        <div class="flex items-center gap-1"><Icon icon="ant-design:eye-outlined" /><span>{{ movieItem.viewNums }}</span></div>
      </div>
      
      <!-- Users & Actions -->
      <div class="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center mt-auto">
        <div class="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          <div class="flex items-center gap-1">
            <span>UP:</span>
            <MemberPopover :userInfo="movieItem.uploader" />
          </div>
          <div class="flex items-center gap-1">
            <span>原作者:</span>
            <MemberPopover :userInfo="movieItem.author" v-if="movieItem.author" />
            <span v-else>{{ movieItem.authorName }}</span>
          </div>
        </div>
        
        <Popconfirm
          title="删除视频后将无法恢复！确定？"
          ok-text="确认"
          cancel-text="取消"
          @confirm="confirmDelete"
          @click.stop=""
        >
          <a-button color="error" size="small">删除</a-button>
        </Popconfirm>
      </div>
    </div>
  </div>

  <!-- Box Size (Used in Activity editing) -->
  <div v-else class="group relative bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer min-w-[240px]" @click="go(`/management/movie/${movieItem.movieId}`)">
    <div class="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-dark-900">
      <img :src="movieItem.movieCover" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div class="absolute top-0 right-0 w-8 h-8 bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer rounded-bl-lg transition-colors z-10" @click.stop="clearDay">
        <Icon icon="ant-design:close-outlined" :size="16" />
      </div>
    </div>
    
    <div class="p-3 flex-1 flex flex-col">
      <h3 class="font-bold text-base text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
        {{ movieItem.movieName.cn }}
      </h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 flex-1">
        {{ movieItem.movieDesc.cn }}
      </p>
      
      <div class="flex justify-between items-center text-xs text-gray-500">
        <div class="flex items-center gap-2">
          <MemberPopover :userInfo="movieItem.uploader" />
        </div>
        <div class="flex gap-2">
          <div class="flex items-center gap-1"><Icon icon="ant-design:like-outlined" /><span>{{ movieItem.likeNums }}</span></div>
          <div class="flex items-center gap-1"><Icon icon="ant-design:eye-outlined" /><span>{{ movieItem.viewNums }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { Tag, Popconfirm } from 'ant-design-vue'
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
<style scoped>
/* Tailwind classes handle the layout */
</style>
