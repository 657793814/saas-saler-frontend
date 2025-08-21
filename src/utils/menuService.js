// src/utils/menuService.js
import apiRequest from './request';

class MenuService {
    constructor() {
        this.menuCache = null;
        this.cacheTime = null;
        this.cacheDuration = 5 * 60 * 1000; // 5分钟缓存
    }

    // 获取用户菜单
    async getUserMenus() {
        // 检查缓存
        if (this.menuCache && this.cacheTime &&
            (Date.now() - this.cacheTime) < this.cacheDuration) {
            return this.menuCache;
        }

        try {
            const result = await apiRequest.post('/api/user/menus');

            if (result.code === 0) {
                this.menuCache = result.data;
                this.cacheTime = Date.now();
                return result.data;
            } else {
                console.error('获取菜单失败:', result.msg);
                return [];
            }
        } catch (error) {
            console.error('获取菜单错误:', error);
            return [];
        }
    }

    // 清除缓存
    clearCache() {
        this.menuCache = null;
        this.cacheTime = null;
    }

    // 根据角色过滤菜单
    filterMenusByRole(menus, userRole) {
        return menus.filter(menu => {
            // 如果菜单没有角色限制，则所有角色都可以访问
            if (!menu.roles || menu.roles.length === 0) {
                return true;
            }
            // 检查用户角色是否在菜单允许的角色列表中
            return menu.roles.includes(userRole);
        });
    }

    // 递归过滤子菜单
    filterMenuTree(menus, userRole) {
        return menus.map(menu => {
            // 过滤当前菜单
            if (menu.roles && menu.roles.length > 0 && !menu.roles.includes(userRole)) {
                return null;
            }

            // 如果有子菜单，递归过滤
            if (menu.children && menu.children.length > 0) {
                const filteredChildren = this.filterMenuTree(menu.children, userRole);
                return {
                    ...menu,
                    children: filteredChildren.filter(child => child !== null)
                };
            }

            return menu;
        }).filter(menu => menu !== null);
    }
}

const menuService = new MenuService();
export default menuService;
