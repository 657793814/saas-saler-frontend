// src/utils/roleService.js
import apiRequest from './request';

class RoleService {
    // 获取角色列表
    async getRoles(params = {}) {
        try {
            const result = await apiRequest.post('/api/role/page', params);
            return result;
        } catch (error) {
            console.error('获取角色列表错误:', error);
            throw error;
        }
    }

    // 创建角色
    async createRole(roleData) {
        try {
            const result = await apiRequest.post('/api/role/add', roleData);
            return result;
        } catch (error) {
            console.error('创建角色错误:', error);
            throw error;
        }
    }

    // 更新角色
    async updateRole(roleData) {
        try {
            const result = await apiRequest.post('/api/role/edit', roleData);
            return result;
        } catch (error) {
            console.error('更新角色错误:', error);
            throw error;
        }
    }
}

const roleService = new RoleService();
export default roleService;