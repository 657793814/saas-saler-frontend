// src/utils/productService.js
import apiRequest from './request';

class ProductService {
    // 获取商品列表
    async getProductList(params = {}) {
        try {
            // 模拟API调用
            const result = await apiRequest.post('/api/products/page', params);
            return result;
        } catch (error) {
            console.error('获取商品列表错误:', error);
        }
    }

    // 创建商品
    async createProduct(productData) {
        try {
            const result = await apiRequest.post('/api/products/create', productData);
            return result;
        } catch (error) {
            console.error('创建商品错误:', error);
            throw error;
        }
    }

    // 更新商品
    async updateProduct(productData) {
        try {
            const result = await apiRequest.put(`/api/products/${productData.id}`, productData);
            return result;
        } catch (error) {
            console.error('更新商品错误:', error);
            throw error;
        }
    }

    // 删除商品
    async deleteProduct(productId) {
        try {
            const result = await apiRequest.delete(`/api/products/${productId}`);
            return result;
        } catch (error) {
            console.error('删除商品错误:', error);
            throw error;
        }
    }

    async specDataPage(postData) {
        try {
            const result = await apiRequest.post(`/api/products/spec_data`, postData);
            return result;
        } catch (error) {
            console.error('加载规格类型失败:', error);
            throw error;
        }
    }
}

const productService = new ProductService();
export default productService;
