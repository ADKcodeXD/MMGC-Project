<template>
  <div class="bg-black body">
    <Suspense>
      <NuxtLayout name="free">
        <div class="statistics-shell">
          <p class="italic title statistics-title">{{ $t('statisticsTitle') }}</p>

          <template v-if="!pageParams.keyword">
            <div class="author-tabs">
              <button
                type="button"
                @click="showType = 'platinum'"
                class="pannel author-tab"
                :class="{ active: showType === 'platinum' }"
              >
                {{ $t('platiumAuthor') }}
              </button>
              <button
                type="button"
                @click="showType = 'gold'"
                class="pannel author-tab"
                :class="{ active: showType === 'gold' }"
              >
                {{ $t('goldAuthor') }}
              </button>
            </div>

            <Transition mode="out-in">
              <div class="author-container" :key="showType">
                <div class="author-item" v-for="item in activeAuthors" :key="item._id">
                  <div class="w-18 h-18 rounded-full overflow-hidden avatar">
                    <MyCustomImage :img="item.authorAvatar || ''" />
                  </div>
                  <p>{{ item.authorName }}</p>
                </div>
              </div>
            </Transition>
          </template>

          <div class="statistics-toolbar">
            <p class="text-left tip text-light-50 font-thin statistics-count" v-if="!pageParams.keyword">
              截至目前已有 {{ total }} 人参加过MMGC
            </p>
            <p class="text-left tip text-light-50 font-thin statistics-count" v-else>
              搜索到 {{ total }} 条结果
            </p>
            <el-input
              v-model="pageParams.keyword"
              class="statistics-search"
              placeholder="搜索作者名"
            >
              <template #prefix>
                <el-icon class="el-input__icon">
                  <Icon name="ant-design:search-outlined" />
                </el-icon>
              </template>
            </el-input>
          </div>

          <div class="statistics-table-wrap">
            <div class="statistics-table">
              <el-row class="row-head-container">
                <el-col :span="4">
                  <p class="row-header">{{ $t('tupian') }}</p>
                </el-col>
                <el-col :span="4">
                  <p class="row-header">{{ $t('author') }}</p>
                </el-col>
                <el-col :span="4">
                  <div class="order">
                    <p class="row-header">{{ $t('consecutiveParticipate') }}</p>
                    <div class="flex flex-col ml-2">
                      <Icon
                        name="ant-design:up-circle-twotone"
                        class="text-light-50 cursor-pointer"
                        @click="changeFields('consecutiveParticipateTimes', 'reverse')"
                        :class="{
                          'text-yellow-600': isActive('consecutiveParticipateTimes', 'reverse')
                        }"
                      ></Icon>
                      <Icon
                        name="ant-design:down-circle-twotone"
                        class="text-light-50 cursor-pointer"
                        @click="changeFields('consecutiveParticipateTimes', '')"
                        :class="{
                          'text-yellow-600': isActive('consecutiveParticipateTimes', '')
                        }"
                      ></Icon>
                    </div>
                  </div>
                </el-col>
                <el-col :span="4">
                  <div class="order">
                    <p class="row-header">{{ $t('participateTimes') }}</p>
                    <div class="flex flex-col ml-2">
                      <Icon
                        name="ant-design:up-circle-twotone"
                        class="text-light-50 cursor-pointer"
                        @click="changeFields('participateTimes', 'reverse')"
                        :class="{
                          'text-yellow-600': isActive('participateTimes', 'reverse')
                        }"
                      ></Icon>
                      <Icon
                        name="ant-design:down-circle-twotone"
                        class="text-light-50 cursor-pointer"
                        @click="changeFields('participateTimes', '')"
                        :class="{
                          'text-yellow-600': isActive('participateTimes', '')
                        }"
                      ></Icon>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <p class="row-header">{{ $t('matches') }}</p>
                </el-col>
              </el-row>

              <div class="container" v-if="rankList.length > 0">
                <el-row class="row-items-container" v-for="item in rankList" :key="item._id">
                  <el-col :span="4">
                    <div class="author-image">
                      <MyCustomImage :img="item.authorAvatar || ''" />
                    </div>
                  </el-col>
                  <el-col :span="4">
                    <p>{{ item.authorName }}</p>
                  </el-col>
                  <el-col :span="4">
                    <p>{{ item.consecutiveParticipateTimes }}</p>
                  </el-col>
                  <el-col :span="4">
                    <p>{{ item.participateTimes }}</p>
                  </el-col>
                  <el-col :span="8">
                    <div class="match-list">
                      <p v-for="match in item.participateMacthes" :key="match">
                        {{ match }}
                      </p>
                    </div>
                  </el-col>
                </el-row>
                <MyCustomLoading v-if="isLoading" />
              </div>

              <div class="container" v-else-if="isLoading">
                <MyCustomLoading />
              </div>
            </div>
          </div>

          <div class="h-48" v-if="!isLoading && total === 0 && rankList.length === 0">
            <MyCustomImage :img="Image404" />
          </div>

          <p class="tip text-light-500 text-xs my-2">
            {{ $t('verifyAndTip') }}
          </p>
        </div>
      </NuxtLayout>
      <template #fallback>
        <LoadingPage2 />
      </template>
    </Suspense>
  </div>
</template>

<script lang="ts" setup>
import Image404 from '@/assets/img/NotFound.png'

const {
  rankList,
  total,
  showType,
  isLoading,
  pageParams,
  goldAuthors,
  platinumAuthors,
  isActive,
  changeFields
} = useStatistics()

const activeAuthors = computed(() =>
  showType.value === 'gold' ? goldAuthors.value : platinumAuthors.value
)
</script>

<style lang="scss" scoped>
.body {
  width: 100%;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background-image: linear-gradient(rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.88)),
    url(@/assets/img/bg.png);
  background-size: cover;
  background-position: center;
  min-width: 320px;
}

.statistics-shell {
  width: min(1120px, 100%);
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 0 28px;
}

.statistics-title {
  width: 100%;
  color: $themeColor;
  font-size: 28px;
  line-height: 1.2;
  text-align: left;
  margin-bottom: 16px;
}

.pannel {
  border: $themeColor 1px solid;
  border-radius: 4px;
}

.author-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
}

.author-tab {
  min-height: 36px;
  color: $themeColor;
  background: rgba(0, 0, 0, 0.72);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &.active,
  &:hover {
    color: #111;
    background: $themeColor;
  }
}

.statistics-toolbar {
  display: flex;
  width: 100%;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin: 14px 0;
}

.statistics-count {
  min-width: 0;
}

.statistics-search {
  width: 260px;
  flex-shrink: 0;
}

.statistics-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.statistics-table {
  min-width: 760px;
}

.row-head-container {
  width: 100%;
  min-height: 44px;
  background: rgba(6, 6, 6, 0.96);
  padding: 6px 8px;
  align-items: center;
  border: solid 1px rgba($themeColor, 0.6);
  border-bottom: 0;
}

.row-header {
  color: $themeColor;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
}

.order {
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(116px, 1fr));
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  margin-top: 8px;
  background: rgba(0, 0, 0, 0.42);
  border: solid 1px rgba($themeColor, 0.35);
  border-radius: 4px;

  .author-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    color: $themeColor;
    min-width: 0;

    p {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.avatar {
  border: 2px $themeColor solid;
}

.container {
  background: linear-gradient(to bottom, rgba(70, 55, 26, 0.85), rgba(0, 0, 0, 0.96));
  width: 100%;
  padding: 0.5rem;
  min-height: 280px;
  border: solid 1px rgba($themeColor, 0.6);
}

.row-items-container {
  color: $themeColor;
  width: 100%;
  min-height: 82px;
  background-color: rgba(0, 0, 0, 0.82);
  border: solid 1px rgba($themeColor, 0.55);
  margin: 6px 0;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  text-align: center;
}

.author-image {
  height: 64px;
  width: 64px;
  margin: 0 auto;
}

.match-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px 10px;
}

@media screen and (max-width: 768px) {
  .statistics-shell {
    width: calc(100% - 20px);
    padding-top: 10px;
  }

  .statistics-title {
    font-size: 24px;
    text-align: center;
  }

  .statistics-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .statistics-search {
    width: 100%;
  }
}
</style>
