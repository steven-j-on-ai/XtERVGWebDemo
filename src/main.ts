import { createApp } from 'vue'
import App from './App.vue'
import 'normalize.css'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import { createPinia } from "pinia";
import 'virtual:svg-icons-register'
import globalComponent from '@/components/index.ts'
import '@/style/global.scss'
import router from './router'
import './router/permission'

const pinia = createPinia();

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(router).use(pinia).use(ElementPlus, { locale: zhCn }).use(globalComponent)

app.mount('#app')