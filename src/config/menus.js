// src/config/menus.js
// 默认菜单配置（备用方案）
export const defaultMenus = [
    {
        id: 'dashboard',
        name: '仪表盘',
        path: '/dashboard',
        icon: 'icon-dashboard',
        roles: ['admin', 'user', 'guest']
    },
    {
        id: 'users',
        name: '用户管理',
        path: '/users',
        icon: 'icon-users',
        roles: ['admin']
    },
    {
        id: 'settings',
        name: '系统设置',
        path: '/settings',
        icon: 'icon-settings',
        roles: ['admin']
    },
    {
        id: 'profile',
        name: '个人中心',
        path: '/profile',
        icon: 'icon-profile',
        roles: ['admin', 'user', 'guest']
    }
];

// 图标映射
export const menuIcons = {
    'icon-dashboard': '📊',
    'icon-users': '👥',
    'icon-settings': '⚙️',
    'icon-profile': '👤',
    'icon-home': '🏠',
    'icon-report': '📈',
    'icon-document': '📄',
    'icon-message': '💬'
};
