// src/utils/productService.js
import apiRequest from './request';

class ProductService {
    // 获取商品列表
    async getProducts(params = {}) {
        try {
            // 模拟API调用
            const result = await apiRequest.get('/api/products', {params});
            return result;
        } catch (error) {
            console.error('获取商品列表错误:', error);
            // 返回模拟数据用于演示
            return {
                code: 0,
                data: {
                    list: [
                        {
                            id: 1,
                            name: '商品1',
                            code: 'P001',
                            price: 99.99,
                            stock: 100,
                            status: 1,
                            description: '商品描述1'
                        },
                        {
                            id: 2,
                            name: '商品2',
                            code: 'P002',
                            price: 199.99,
                            stock: 50,
                            status: 1,
                            description: '商品描述2'
                        }
                    ],
                    total: 2
                }
            };
        }
    }

    // 创建商品
    async createProduct(productData) {
        try {
            const result = await apiRequest.post('/api/products', productData);
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
}

const productService = new ProductService();
export default productService;
