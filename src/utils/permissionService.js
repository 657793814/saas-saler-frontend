// src/utils/permissionService.js
import apiRequest from './request';

class PermissionService {
    // 分页获取权限列表（支持分页和搜索）
    async getPermissions(params = {}) {
        try {
            const result = await apiRequest.post('/api/permissions/page', params);
            return result;
        } catch (error) {
            console.error('获取权限列表错误:', error);
        }
    }

    //获取所有权限点
    async getAllPermission(params = {}) {
        try {
            const result = await apiRequest.post('/api/permissions/all', params);
            return result;
        } catch (error) {
            console.error('获取权限列表错误:', error);
        }
    }

    async getRolePermissions(params = {}) {
        try {
            const result = await apiRequest.post('/api/permissions/by_role', {role_id: params.roleId}, {});
            return result;
        } catch (error) {
            console.error('获取权限列表错误:', error);
        }
    }


    // 创建权限
    async createPermission(permissionData) {
        try {
            const result = await apiRequest.post('/api/permissions/add', permissionData);
            return result;
        } catch (error) {
            console.error('创建权限错误:', error);
            throw error;
        }
    }

    // 更新权限
    async updatePermission(permissionData) {
        try {
            const result = await apiRequest.post(`/api/permissions/edit`, permissionData);
            return result;
        } catch (error) {
            console.error('更新权限错误:', error);
            throw error;
        }
    }

    // 删除权限
    async deletePermission(param) {
        try {
            const result = await apiRequest.post(`/api/permissions/del`, param);
            return result;
        } catch (error) {
            console.error('删除权限错误:', error);
            throw error;
        }
    }

    //更新角色权限
    async updateRolePermissions(postData) {
        try {
            const result = await apiRequest.post(`/api/permissions/edit_role_permission`, postData);
            return result;
        } catch (error) {
            console.error('更新权限错误:', error);
            throw error;
        }
    }
}

const permissionService = new PermissionService();
export default permissionService;
