// src/router/index.js
import {createRouter, createWebHistory} from 'vue-router'
import Login from '@/components/Login.vue'

// 确保所有导入的组件都存在
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
        component: () => import('@/views/user/UserManagement.vue'),
        meta: {requiresAuth: true, roles: ['admin']}
    },
    // 商品管理路由
    {
        path: '/products',
        name: 'Products',
        component: () => import('@/layouts/SystemManageLayout.vue'),
        meta: {title: '商品管理', requiresAuth: true},
        children: [
            {
                path: '',
                redirect: 'list'
            },
            {
                path: 'list',
                name: 'ProductList',
                component: () => import('@/views/products/ProductList.vue'),
                meta: {title: '商品管理'}
            },
            {
                path: 'specifications',
                name: 'SpecificationsManage',
                component: () => import('@/views/products/Specifications.vue'),
                meta: {title: '规格设置'}
            },
            {
                path: 'shipping-templates',
                name: 'ShippingTemplates',
                component: () => import('@/views/products/ShippingTemplates.vue'),
                meta: {title: '运费模板'}
            }
        ]
    },
    {
        path: '/system',
        name: 'System',
        component: () => import('@/layouts/SystemManageLayout.vue'),
        meta: {title: '系统管理', requiresAuth: true},
        children: [
            {
                path: '',
                redirect: 'roles'
            },
            {
                path: 'roles',
                name: 'RoleManagement',
                component: () => import('@/views/system/RoleManagement.vue'),
                meta: {title: '角色管理'}
            },
            {
                path: 'permissions',
                name: 'PermissionManagement',
                component: () => import('@/views/system/PermissionManagement.vue'),
                meta: {title: '权限管理'}
            }
        ]
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: {requiresAuth: true, roles: ['admin']}
    },
    // 404 页面
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 简化路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth && !token) {
        next('/')
    } else {
        next()
    }
})

export default router