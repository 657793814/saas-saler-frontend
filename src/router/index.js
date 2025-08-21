// router/index.js
import {createRouter, createWebHistory} from 'vue-router'
import Login from '@/components/Login.vue'

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
        component: () => import('@/views/Dashboard.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/users',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue'),
        meta: {requiresAuth: true, roles: ['admin']}
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: {requiresAuth: true, roles: ['admin']}
    },
    // 可以添加更多路由...
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
