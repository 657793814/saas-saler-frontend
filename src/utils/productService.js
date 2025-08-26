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

    async editProduct(productData) {
        try {
            const result = await apiRequest.post('/api/products/edit', productData);
            return result;
        } catch (error) {
            console.error('创建商品错误:', error);
            throw error;
        }
    }

    async getProductDetail(param) {
        try {
            const result = await apiRequest.get('/api/products/detail', param);
            return result;
        } catch (error) {
            console.error('创建商品错误:', error);
            throw error;
        }
    }


    async updateProductStatus(data) {
        try {
            const result = await apiRequest.post(`/api/products/update_product_status`, data);
            return result;
        } catch (error) {
            console.error('删除商品错误:', error);
            throw error;
        }
    }

    async updateSkuStatus(data) {
        try {
            const result = await apiRequest.post(`/api/products/update_sku_status`, data);
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

    async getCategoryData() {
        try {
            const result = await apiRequest.get(`/api/products/category_data`);
            return result;
        } catch (error) {
            console.error('加载商品分类失败:', error);
            throw error;
        }
    }

    async getShippingTemplates() {
        try {
            const result = await apiRequest.get(`/api/products/shipping_template_data`);
            return result;
        } catch (error) {
            console.error('加载商品分类失败:', error);
            throw error;
        }
    }
}

const productService = new ProductService();
export default productService;
