<template>
  <template v-if="getShow">
    <LoginFormTitle class="enter-x" />
    <Form
      class="enter-x"
      :model="formData"
      :rules="getFormRules"
      ref="formRef"
      :labelCol="{ span: 4 }"
      labelAlign="left"
    >
      <FormItem
        name="username"
        class="enter-x"
        label="用户名"
        :rules="[
          { required: true, message: '请输入你的用户名', trigger: 'blur' },
          { min: 6, max: 16, message: '长度请控制在6-16位', trigger: 'change' },
        ]"
      >
        <Input
          class="fix-auto-fill"
          v-model:value="formData.username"
          placeholder="用户名，登录凭证"
        />
      </FormItem>
      <FormItem
        name="memberName"
        class="enter-x"
        label="昵称"
        :rules="[
          { required: true, message: '请输入你的昵称', trigger: 'blur' },
          { min: 6, max: 16, message: '长度请控制在6-16位', trigger: 'change' },
        ]"
      >
        <Input
          class="fix-auto-fill"
          v-model:value="formData.memberName"
          placeholder="昵称 您的称呼"
        />
      </FormItem>
      <FormItem
        name="email"
        class="enter-x"
        label="邮箱"
        :rules="[
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            pattern: emailReg,
            message: '请输入正确的邮箱',
            trigger: 'blur',
          },
        ]"
      >
        <Input v-model:value="formData.email" placeholder="邮箱" class="fix-auto-fill" />
      </FormItem>
      <FormItem
        name="verifyCode"
        class="enter-x"
        label="验证码"
        :rules="[{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }]"
      >
        <CountdownInput
          class="fix-auto-fill"
          v-model:value="formData.verifyCode"
          placeholder="邮箱验证码"
          :sendCodeApi="getVerifyCode"
        />
      </FormItem>
      <FormItem
        name="password"
        class="enter-x"
        label="密码"
        :rules="[
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度请控制在6-16位', trigger: 'change' },
        ]"
      >
        <InputPassword visibilityToggle v-model:value="formData.password" placeholder="输入密码" />
      </FormItem>
      <FormItem
        name="confirmPassword"
        class="enter-x"
        label="确认密码"
        :rules="[
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: confirm, message: '两次输入密码不一致' },
          { min: 6, max: 16, message: '长度请控制在6-16位', trigger: 'change' },
        ]"
      >
        <InputPassword
          visibilityToggle
          v-model:value="formData.confirmPassword"
          :placeholder="t('sys.login.confirmPassword')"
        />
      </FormItem>

      <Button
        type="primary"
        class="enter-x"
        size="large"
        block
        @click="handleRegister"
        :loading="loading"
      >
        {{ t('sys.login.registerButton') }}
      </Button>
      <Button size="large" block class="mt-4 enter-x" @click="handleBackLogin">
        {{ t('sys.login.backSignIn') }}
      </Button>
    </Form>
  </template>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed } from 'vue'
  import LoginFormTitle from './LoginFormTitle.vue'
  import { Form, Input, Button } from 'ant-design-vue'
  import { CountdownInput } from '/@/components/CountDown'
  import { useI18n } from '/@/hooks/web/useI18n'
  import { useLoginState, useFormRules, useFormValid, LoginStateEnum } from './useLogin'
  import { getCode } from '/@/api/email/emailApi'
  import { register } from '/@/api/member/member'
  import { useMessage } from '/@/hooks/web/useMessage'
  import { MemberParams } from '/@/api/member/model/memberEntity'
  import { useUserStore } from '/@/store/modules/user'
  const FormItem = Form.Item
  const InputPassword = Input.Password

  const { createMessage } = useMessage()
  const { t } = useI18n()
  const { handleBackLogin, getLoginState } = useLoginState()
  const emailReg = /^[a-zA-Z0-9_.]+@[a-zA-Z0-9-]+[.a-zA-Z]+$/
  const formRef = ref()
  const loading = ref(false)

  const getVerifyCode = () => {
    if (!formData.email) {
      createMessage.error('未输入邮箱')
      return Promise.reject(false)
    }
    if (emailReg.test(formData.email)) {
      return getCode({ email: formData.email })
    } else {
      createMessage.error('输入邮箱不正确')
      return Promise.reject(false)
    }
  }

  const confirm = async () => {
    if (formData.password !== formData.confirmPassword) {
      return Promise.reject('两次输入密码不一致')
    }
    return Promise.resolve()
  }

  const formData = reactive<MemberParams>({
    username: '',
    password: '',
    confirmPassword: '',
    memberName: '',
    email: '',
    verifyCode: '',
  })

  const { getFormRules } = useFormRules(formData)
  const { validForm } = useFormValid(formRef)

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.REGISTER)

  const userStore = useUserStore()

  async function handleRegister() {
    const data = await validForm()
    if (!data) return
    formData.verifyCode = parseInt(formData.verifyCode)

    const res = await register(formData)
    userStore.setToken(res.data)
    userStore.afterLoginAction(true)
    createMessage.success(`注册成功`)
  }
</script>
