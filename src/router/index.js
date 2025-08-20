// router/index.js
import {createRouter, createWebHistory} from 'vue-router'
import Login from '@/components/Login.vue'
import UserManagement from '@/views/UserManagement.vue'

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login
    },
    {
        path: '/login',
        name: 'LoginRedirect',
        component: Login
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'), // 需要创建这个组件
        meta: {requiresAuth: true}
    },
    {
        path: '/users',
        name: 'UserManagement',
        component: UserManagement,
        meta: {requiresAuth: true}
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'), // 需要创建这个组件
        meta: {requiresAuth: true}
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth && !token) {
        next('/')
    } else if ((to.path === '/' || to.path === '/login') && token) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router