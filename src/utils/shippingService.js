// src/utils/shippingService.js
import apiRequest from './request';

class ShippingService {
    // 获取模板列表
    async getTemplates(params = {}) {
        try {
            // 模拟API调用
            const result = await apiRequest.get('/api/shipping-templates', {params});
            return result;
        } catch (error) {
            console.error('获取模板列表错误:', error);
            // 返回模拟数据用于演示
            return {
                code: 0,
                data: {
                    list: [
                        {id: 1, name: '默认模板', method: 'weight', defaultFee: 10.00, description: '默认运费模板'},
                        {id: 2, name: '包邮模板', method: 'quantity', defaultFee: 0.00, description: '满99元包邮'}
                    ],
                    total: 2
                }
            };
        }
    }

    // 创建模板
    async createTemplate(templateData) {
        try {
            const result = await apiRequest.post('/api/shipping-templates', templateData);
            return result;
        } catch (error) {
            console.error('创建模板错误:', error);
            throw error;
        }
    }

    // 更新模板
    async updateTemplate(templateData) {
        try {
            const result = await apiRequest.put(`/api/shipping-templates/${templateData.id}`, templateData);
            return result;
        } catch (error) {
            console.error('更新模板错误:', error);
            throw error;
        }
    }

    // 删除模板
    async deleteTemplate(templateId) {
        try {
            const result = await apiRequest.delete(`/api/shipping-templates/${templateId}`);
            return result;
        } catch (error) {
            console.error('删除模板错误:', error);
            throw error;
        }
    }
}

const shippingService = new ShippingService();
export default shippingService;
