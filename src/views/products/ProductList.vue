<!-- src/views/products/ProductList.vue -->
<template>
  <div class="product-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="handleAdd">新增商品</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.name" placeholder="商品名称" clearable/>
          </el-form-item>
          <el-form-item label="商品编码">
            <el-input v-model="searchForm.code" placeholder="商品编码" clearable/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchProducts">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 商品列表 -->
      <el-table
          :data="products"
          style="width: 100%"
          v-loading="loading"
          border
          row-key="id"
          :expand-row-keys="expandedRowKeys"
          @expand-change="handleExpandChange"
      >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template #default="props">
            <el-table
                :data="props.row.children"
                style="width: 100%"
                border
                class="sku-table"
            >
              <el-table-column prop="skuId" label="SKU ID" width="100"/>
              <el-table-column prop="code" label="商品code" width="200"/>
              <el-table-column prop="spec" label="规格" width="200"/>
              <el-table-column prop="price" label="销售价" width="120">
                <template #default="scope">
                  ¥{{ scope.row.salePrice }}
                </template>
              </el-table-column>
              <el-table-column prop="costPrice" label="采购价" width="120">
                <template #default="scope">
                  ¥{{ scope.row.costPrice }}
                </template>
              </el-table-column>
              <el-table-column prop="stock" label="库存" width="100"/>
              <el-table-column label="预览图" width="120">
                <template #default="scope">
                  <el-image
                      v-if="scope.row.imgUrl"
                      :src="scope.row.imgUrl"
                      class="sku-preview"
                      fit="cover"
                      :preview-src-list="[scope.row.imgUrl]"
                  />
                  <span v-else>无图片</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button
                      size="small"
                      :type="scope.row.status === 1 ? 'warning' : 'success'"
                      @click="toggleSkuStatus(scope.row, props.row)"
                  >
                    {{ scope.row.status === 1 ? '下架' : '上架' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <el-table-column prop="productId" label="商品ID" width="80"/>
        <el-table-column prop="name" label="产品名称" min-width="200"/>
        <el-table-column prop="code" label="产品code" min-width="200"/>
        <el-table-column label="SKU数量" width="100">
          <template #default="scope">
            <span v-if="scope.row.children && scope.row.children.length > 0">
              {{ scope.row.children.length }}
            </span>
            <span v-else>无SKU</span>
          </template>
        </el-table-column>
        <el-table-column label="预览图" width="120">
          <template #default="scope">
            <el-image
                v-if="scope.row.imgUrl"
                :src="scope.row.imgUrl"
                class="sku-preview"
                fit="cover"
                :preview-src-list="[scope.row.imgUrl]"
            />
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button
                size="small"
                :type="scope.row.status === 1 ? 'warning' : 'success'"
                @click="toggleProductStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button
                size="small"
                type="primary"
                @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import {onMounted, reactive, ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import productService from '@/utils/productService';
import {useRouter} from 'vue-router';

export default {
  name: 'ProductList',
  setup() {
    const products = ref([]);
    const loading = ref(false);
    const submitLoading = ref(false);
    const router = useRouter();
    const expandedRowKeys = ref([]); // 用于控制展开的行

    // 搜索表单
    const searchForm = reactive({
      name: '',
      code: ''
    });

    // 分页
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    });

    // 获取商品列表
    const fetchProducts = async () => {
      loading.value = true;
      try {
        const params = {
          current: pagination.currentPage,
          size: pagination.pageSize,
          title: searchForm.name,
          code: searchForm.code
        };

        const result = await productService.getProductList(params);
        if (result.code === 0) {
          products.value = result.data.records || [];
          pagination.total = result.data.total || 0;
        } else {
          ElMessage.error(result.msg || '获取商品列表失败');
        }
      } catch (error) {
        ElMessage.error('获取商品列表出错: ' + error.message);
      } finally {
        loading.value = false;
      }
    };

    // 搜索商品
    const searchProducts = () => {
      pagination.currentPage = 1;
      fetchProducts();
    };

    // 重置搜索
    const resetSearch = () => {
      searchForm.name = '';
      searchForm.code = '';
      pagination.currentPage = 1;
      fetchProducts();
    };

    // 新增商品
    const handleAdd = () => {
      router.push('/products/create');
    };

    // 编辑商品
    const handleEdit = (row) => {
      router.push({
        path: '/products/edit',
        query: {productId: row.id}
      });
    };

    // 删除商品
    const handleDelete = (row) => {
      ElMessageBox.confirm(
          `确定要删除商品 "${row.title}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(async () => {
        try {
          const result = await productService.deleteProduct(row.id);
          if (result.code === 0) {
            ElMessage.success('删除成功');
            fetchProducts();
          } else {
            ElMessage.error(result.msg || '删除失败');
          }
        } catch (error) {
          ElMessage.error('删除出错: ' + error.message);
        }
      }).catch(() => {
        // 用户取消删除
      });
    };

    // 切换商品状态
    const toggleProductStatus = async (row) => {
      let newStatus;
      try {
        const newStatus = row.status === 1 ? 0 : 1;
        const result = await productService.updateProductStatus(row.id, newStatus);
        if (result.code === 0) {
          ElMessage.success(`${newStatus === 1 ? '上架' : '下架'}成功`);
          row.status = newStatus;
        } else {
          ElMessage.error(result.msg || `${newStatus === 1 ? '上架' : '下架'}失败`);
        }
      } catch (error) {
        ElMessage.error(`${newStatus === 1 ? '上架' : '下架'}出错: ` + error.message);
      }
    };

    // 切换SKU状态
    const toggleSkuStatus = async (skuRow) => {
      let newStatus;
      try {
        const newStatus = skuRow.status === 1 ? 0 : 1;
        const result = await productService.updateSkuStatus(skuRow.id, newStatus);
        if (result.code === 0) {
          ElMessage.success(`${newStatus === 1 ? '上架' : '下架'}成功`);
          skuRow.status = newStatus;
        } else {
          ElMessage.error(result.msg || `${newStatus === 1 ? '上架' : '下架'}失败`);
        }
      } catch (error) {
        ElMessage.error(`${newStatus === 1 ? '上架' : '下架'}出错: ` + error.message);
      }
    };

    // 处理展开/收起事件
    const handleExpandChange = (row, expandedRows) => {
      console.log('handleExpandChange', row, expandedRows);
      // 可以在这里处理展开逻辑，比如懒加载SKU数据
    };

    // 分页相关方法
    const handleSizeChange = (val) => {
      pagination.pageSize = val;
      fetchProducts();
    };

    const handleCurrentChange = (val) => {
      pagination.currentPage = val;
      fetchProducts();
    };

    onMounted(() => {
      fetchProducts();
    });

    return {
      products,
      loading,
      submitLoading,
      searchForm,
      pagination,
      expandedRowKeys,
      fetchProducts,
      searchProducts,
      resetSearch,
      handleAdd,
      handleEdit,
      handleDelete,
      toggleProductStatus,
      toggleSkuStatus,
      handleExpandChange,
      handleSizeChange,
      handleCurrentChange
    };
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.sku-table {
  margin-left: 50px;
  margin-right: 50px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.sku-preview {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.dialog-footer {
  text-align: right;
}
</style>

