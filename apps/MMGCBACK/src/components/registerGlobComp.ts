import type { App } from 'vue'
import { Button } from './Button'
import { Input, Layout } from 'ant-design-vue'
import { AutoTranslate } from './AutoTranslate'

export function registerGlobComp(app: App) {
  app.use(Input).use(Button).use(Layout)
  app.component('AutoTranslate', AutoTranslate)
}
