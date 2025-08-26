// src/utils/menuService.js
import {defaultMenus} from "@/config/menus";
import apiRequest from "@/utils/request";

class MenuService {
    constructor() {
        this.menuCache = null;
        this.cacheTime = null;
        this.openMenuCache = false;  //是否开启menus缓存
        this.cacheDuration = 1 * 60 * 1000; // 1分钟缓存
    }

    // 获取用户菜单
    async getUserMenus() {
        // 检查缓存
        if (this.openMenuCache && this.menuCache && this.cacheTime &&
            (Date.now() - this.cacheTime) < this.cacheDuration) {
            return this.menuCache;
        }

        try {
            const requestData = {};
            const result = await apiRequest.post('/api/user/menus', requestData);

            if (result.code === 0) {
                this.menuCache = result.data;
                this.cacheTime = Date.now();
                return result.data;
            } else {
                console.error('获取菜单失败:', result.msg);
                // 返回默认菜单作为备用方案
                return defaultMenus;
            }
        } catch (error) {
            console.error('获取菜单错误:', error);
            // 返回默认菜单作为备用方案
            return defaultMenus;
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
        if (!menus || !Array.isArray(menus)) {
            return [];
        }

        return menus.map(menu => {
            // 检查菜单对象是否存在且有效
            if (!menu || typeof menu !== 'object') {
                return null;
            }

            // 检查用户是否有权限访问此菜单
            if (menu.roles && menu.roles.length > 0 && !menu.roles.includes(userRole)) {
                return null;
            }

            // 确保菜单有 name 属性
            if (!menu.name) {
                return null;
            }

            // 如果有子菜单，递归过滤
            if (menu.children && menu.children.length > 0) {
                const filteredChildren = this.filterMenuTree(menu.children, userRole);
                const validChildren = filteredChildren.filter(child => child !== null);

                // 如果父菜单没有 path 但有有效的子菜单，则保留父菜单
                if (validChildren.length > 0) {
                    return {
                        ...menu,
                        children: validChildren
                    };
                }
                // 如果父菜单没有 path 且没有有效子菜单，则过滤掉
                else if (!menu.path) {
                    return null;
                }
            }

            // 如果菜单有 path 或者有子菜单，则保留
            if (menu.path) {
                return menu;
            }

            // 过滤掉既没有 path 也没有子菜单的菜单项
            return null;
        }).filter(menu => menu !== null);
    }
}

const menuService = new MenuService();
export default menuService;
