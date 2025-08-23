// src/utils/specService.js
import apiRequest from './request';

class SpecService {
    // 获取规格列表
    async getSpecifications(params = {}) {
        try {
            // 模拟API调用
            const result = await apiRequest.get('/api/specifications', {params});
            return result;
        } catch (error) {
            console.error('获取规格列表错误:', error);
            // 返回模拟数据用于演示
            return {
                code: 0,
                data: {
                    list: [
                        {id: 1, name: '颜色', values: ['红色', '蓝色', '绿色']},
                        {id: 2, name: '尺寸', values: ['S', 'M', 'L', 'XL']}
                    ],
                    total: 2
                }
            };
        }
    }

    // 创建规格
    async createSpecification(specData) {
        try {
            const result = await apiRequest.post('/api/specifications', specData);
            return result;
        } catch (error) {
            console.error('创建规格错误:', error);
            throw error;
        }
    }

    // 更新规格
    async updateSpecification(specData) {
        try {
            const result = await apiRequest.put(`/api/specifications/${specData.id}`, specData);
            return result;
        } catch (error) {
            console.error('更新规格错误:', error);
            throw error;
        }
    }

    // 删除规格
    async deleteSpecification(specId) {
        try {
            const result = await apiRequest.delete(`/api/specifications/${specId}`);
            return result;
        } catch (error) {
            console.error('删除规格错误:', error);
            throw error;
        }
    }
}

const specService = new SpecService();
export default specService;
