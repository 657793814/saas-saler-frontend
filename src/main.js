import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import {menuIconCSS} from '@/config/menus'

// 引入全局样式
import './assets/styles/modals.css'
import 'element-plus/dist/index.css'

// 注入自定义图标样式
const style = document.createElement('style')
style.textContent = menuIconCSS
document.head.appendChild(style)

createApp(App)
    .use(store)
    .use(ElementPlus)
    .use(router)
    .mount('#app')
