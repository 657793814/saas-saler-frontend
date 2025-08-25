// src/utils/specService.js
import apiRequest from './request';

class SpecService {
    // 获取规格列表
    async getSpecDataPage(params = {}) {
        try {
            const result = await apiRequest.post('/api/products/spec_page', params);
            return result;
        } catch (error) {
            console.error('获取规格列表错误:', error);
        }
    }

    // 规格类型下创建规格值
    async addSpecValueToType(specData) {
        try {
            const result = await apiRequest.post('/api/products/create_spec_value', specData);
            return result;
        } catch (error) {
            console.error('创建规格值错误:', error);
            throw error;
        }
    }

    async updateSpecTypeStatus(data) {
        try {
            const result = await apiRequest.post(`/api/products/update_spec_type_status`, data);
            return result;
        } catch (error) {
            console.error('更新规格类型状态错误:', error);
            throw error;
        }
    }

    // 更新规格值状态
    async updateSpecValueStatus(data) {
        try {
            const result = await apiRequest.post(`/api/products/update_spec_value_status`, data);
            return result;
        } catch (error) {
            console.error('更新规格值状态错误:', error);
            throw error;
        }
    }
}

const specService = new SpecService();
export default specService;
