// src/config/menus.js
// 默认菜单配置（备用方案）
export const defaultMenus = [
    {
        id: 'dashboard',
        name: '仪表盘',
        path: '/dashboard',
        icon: 'el-icon-data-board',
        roles: ['admin', 'user', 'guest']
    },
    {
        id: 'users',
        name: '用户管理',
        path: '/users',
        icon: 'el-icon-user',
        roles: ['admin', 'user', 'guest']
    },
    {
        id: 'products',
        name: '商品管理',
        path: '/products',
        icon: 'el-icon-goods',
        roles: ['admin', 'user'],
        children: [
            {
                id: 'product-list',
                name: '商品管理',
                path: '/products/list',
                icon: 'el-icon-goods',
                roles: ['admin', 'user']
            },
            {
                id: 'specifications',
                name: '规格设置',
                path: '/products/specifications',
                icon: 'el-icon-setting',
                roles: ['admin']
            },
            {
                id: 'shipping-templates',
                name: '运费模板',
                path: '/products/shipping-templates',
                icon: 'el-icon-truck',
                roles: ['admin', 'user']
            }
        ]
    },
    {
        id: 'system',
        name: '系统管理',
        path: '/system',
        icon: 'el-icon-setting',
        roles: ['admin'],
        children: [
            {
                id: 'role-management',
                name: '角色管理',
                path: '/system/roles',
                icon: 'el-icon-lock',
                roles: ['admin']
            },
            {
                id: 'permission-management',
                name: '权限管理',
                path: '/system/permissions',
                icon: 'el-icon-key',
                roles: ['admin']
            }
        ]
    },
    {
        id: 'settings',
        name: '系统设置',
        path: '/settings',
        icon: 'el-icon-tools',
        roles: ['admin', 'user', 'guest']
    },
];

// 图标CSS样式字符串
export const menuIconCSS = `
  .el-icon-data-board::before { content: "📊"; }
  .el-icon-user::before { content: "👤"; }
  .el-icon-goods::before { content: "🛍️"; }
  .el-icon-setting::before { content: "⚙️"; }
  .el-icon-lock::before { content: "🔒"; }
  .el-icon-key::before { content: "🔑"; }
  .el-icon-tools::before { content: "🔧"; }
  .el-icon-truck::before { content: "🚚"; }
`;
