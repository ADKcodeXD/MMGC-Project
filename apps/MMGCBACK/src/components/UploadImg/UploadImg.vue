<template>
  <div>
    <Upload
      name="avatar"
      :show-upload-list="false"
      :before-upload="beforeUpload"
      :disabled="disabled || !!onlineImg"
      accept="image/png,image/jpeg,image/webp,image/gif"
    >
      <slot>
        <div
          class="upload-square"
          :style="{ width: `${customWidth}px` }"
          :class="{ disabled: disabled }"
          v-if="onlineImg"
        >
          <Image :src="onlineImg" :width="customWidth" alt="avatar" />
        </div>
        <div
          v-else
          class="upload-square"
          :style="{ width: `${customWidth}px` }"
          :class="{ disabled: disabled }"
        >
          <PlusOutlined />
          <p>上传封面</p>
        </div>
        <a-button type="primary" @click="resetImg" v-if="onlineImg" :disabled="disabled">
          重新上传
        </a-button>
      </slot>
    </Upload>
  </div>
  <Modal :visible="isCropperShow" title="裁剪图片">
    <CropperImage :src="localImg" @cropend="cropEnd" v-if="isCropperShow" :options="options" />
    <template #footer>
      <a-button key="back" @click="isCropperShow = false">取消</a-button>
      <a-button key="submit" type="primary" :loading="isLoading" @click="handleUpload(false)">
        提交
      </a-button>
      <a-button key="normal" type="primary" :loading="isLoading" @click="handleUpload(true)">
        直接上传(不裁剪)
      </a-button>
    </template>
  </Modal>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import { uploadImgApi } from '/@/api/upload/uploadApi'
  import { PlusOutlined } from '@ant-design/icons-vue'
  import { Upload, Image, Modal } from 'ant-design-vue'
  import { CropperImage } from '/@/components/Cropper'
  import { useMessage } from '/@/hooks/web/useMessage'
  import { dataURLtoBlob, urlToBase64 } from '/@/utils/file/base64Conver'
  const props = withDefaults(
    defineProps<{
      onlineImg: string
      disabled?: boolean
      aspectRatio?: number
      customWidth?: number
    }>(),
    {
      onlineImg: '',
      disabled: false,
      aspectRatio: NaN,
      customWidth: 500,
    },
  )
  const emit = defineEmits(['changeImg'])
  const { createMessage } = useMessage()
  const localImg = ref('')
  const uploadImg = ref('')
  const isCropperShow = ref(false)
  const fileName = ref('')
  const isLoading = ref(false)
  const rawImg = ref<File>()
  const loadingProgress = ref(0)
  const options = {
    aspectRatio: props.aspectRatio, // 默认比例
    guides: false, // 裁剪框的虚线(九宫格)
    autoCropArea: 0.5, // 0-1之间的数值，定义自动剪裁区域的大小，默认0.8
    movable: false, // 是否允许移动图片
    dragCrop: true, // 是否允许移除当前的剪裁框，并通过拖动来新建一个剪裁框区域
    resizable: true, // 是否允许改变裁剪框的大小
    scalable: false, //是否可以缩放图片
    zoomable: true, // 是否允许缩放图片大小
    mouseWheelZoom: false, // 是否允许通过鼠标滚轮来缩放图片
    touchDragZoom: false, // 是否允许通过触摸移动来缩放图片
    rotatable: true, // 是否允许旋转图片
  }
  const resetImg = () => {
    localImg.value = ''
    emit('changeImg', undefined)
  }

  const beforeUpload = async (img: File) => {
    const exts = img.name.split('.')
    const ext = exts[exts.length - 1]
    if (img.name) {
      const reg = /(png|jpg|gif|jpeg|webp|jfif)$/
      if (!ext) {
        createMessage.error('格式错误')
        return false
      }
      if (!reg.test(ext)) {
        createMessage.error('请上传 png|jpg|gif|webp 格式的文件')
        return false
      }
    }
    if (img.size > 1024 * 1024 * 10) {
      createMessage.error('请勿上传大于10MB的图片')
      return false
    }
    fileName.value = img.name
    const gifReg = /(gif)$/
    if (gifReg.test(ext)) {
      uploadImg.value = await urlToBase64(window.URL.createObjectURL(img))
      handleUpload()
      return
    }
    const url = window.URL.createObjectURL(img)
    rawImg.value = img
    localImg.value = url
    isCropperShow.value = true
    return false
  }

  const cropEnd = ({ imgBase64 }) => {
    uploadImg.value = imgBase64
  }

  const handleUpload = async (isDire?: boolean) => {
    isLoading.value = true
    let blob
    if (isDire) {
      blob = rawImg.value
    } else {
      blob = dataURLtoBlob(uploadImg.value)
    }
    try {
      const { data } = await uploadImgApi(
        { name: 'file', file: blob, filename: fileName.value },
        (progressEvent: ProgressEvent) => {
          const complete = ((progressEvent.loaded / progressEvent.total) * 100) | 0
          loadingProgress.value = complete
        },
      )
      emit('changeImg', data)
      createMessage.success('上传成功')
      isCropperShow.value = false
    } finally {
      isLoading.value = false
    }
  }
</script>

<style lang="less" scoped>
  .upload-square {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px dashed rgb(78, 199, 255);
    width: 600px;
    height: 280px;
    overflow: hidden;

    &.disabled {
      filter: grayscale(0.4);
      background-color: rgb(219, 219, 219);
      color: rgb(131, 131, 131);
      cursor: not-allowed;
    }

    &:hover {
      box-shadow: 0 0 5px rgb(78, 199, 255, 0.4);
    }
  }
</style>
