// src/utils/shippingService.js
import apiRequest from './request';

class ShippingService {
    // 获取模板列表
    async getTemplates(params = {}) {
        try {
            // 模拟API调用
            const result = await apiRequest.post('/api/products/shipping_templates_page', params);
            return result;
        } catch (error) {
            console.error('获取模板列表错误:', error);
        }
    }

    // 创建模板
    async createTemplate(templateData) {
        try {
            const result = await apiRequest.post('/api/products/create_shipping_templates', templateData);
            return result;
        } catch (error) {
            console.error('创建模板错误:', error);
            throw error;
        }
    }

    // 更新模板
    async updateTemplate(templateData) {
        try {
            const result = await apiRequest.post(`/api/products/edit_shipping_templates`, templateData);
            return result;
        } catch (error) {
            console.error('更新模板错误:', error);
            throw error;
        }
    }

    // 删除模板
    async deleteTemplate(templateId) {
        try {
            const result = await apiRequest.post(`/api/products/del_shipping_templates`, {id: templateId});
            return result;
        } catch (error) {
            console.error('删除模板错误:', error);
            throw error;
        }
    }
}

const shippingService = new ShippingService();
export default shippingService;
