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
      <el-table :data="products" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="name" label="商品名称" width="180"/>
        <el-table-column prop="code" label="商品编码" width="150"/>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100"/>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 商品编辑对话框 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="600px"
        @close="handleDialogClose"
    >
      <el-form
          :model="form"
          :rules="productRules"
          ref="productFormRef"
          label-width="100px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称"/>
        </el-form-item>
        <el-form-item label="商品编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入商品编码" :disabled="isEditMode"/>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model.number="form.price" placeholder="请输入价格">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input v-model.number="form.stock" placeholder="请输入库存数量"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              placeholder="请输入商品描述"
              :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProduct" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {computed, onMounted, reactive, ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import productService from '@/utils/productService';

export default {
  name: 'ProductList',
  setup() {
    const products = ref([]);
    const loading = ref(false);
    const submitLoading = ref(false);
    const dialogVisible = ref(false);
    const isEditMode = ref(false);
    const productFormRef = ref(null);

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

    // 商品表单
    const form = reactive({
      id: null,
      name: '',
      code: '',
      price: 0,
      stock: 0,
      status: 1,
      description: ''
    });

    // 表单验证规则
    const productRules = {
      name: [
        {required: true, message: '请输入商品名称', trigger: 'blur'}
      ],
      code: [
        {required: true, message: '请输入商品编码', trigger: 'blur'}
      ],
      price: [
        {required: true, message: '请输入价格', trigger: 'blur'},
        {type: 'number', message: '价格必须为数字', trigger: 'blur'}
      ],
      stock: [
        {required: true, message: '请输入库存', trigger: 'blur'},
        {type: 'number', message: '库存必须为数字', trigger: 'blur'}
      ]
    };

    const dialogTitle = computed(() => {
      return isEditMode.value ? '编辑商品' : '新增商品';
    });

    // 获取商品列表
    const fetchProducts = async () => {
      loading.value = true;
      try {
        const params = {
          page: pagination.currentPage,
          size: pagination.pageSize,
          name: searchForm.name,
          code: searchForm.code
        };

        const result = await productService.getProducts(params);
        if (result.code === 0) {
          products.value = result.data.list || [];
          pagination.total = result.data.total || 0;
        } else {
          ElMessage.error(result.msg || '获取商品列表失败');
        }
      } catch (error) {
        ElMessage.error('获取商品列表出错');
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
      isEditMode.value = false;
      dialogVisible.value = true;
      // 重置表单
      Object.assign(form, {
        id: null,
        name: '',
        code: '',
        price: 0,
        stock: 0,
        status: 1,
        description: ''
      });
    };

    // 编辑商品
    const handleEdit = (row) => {
      isEditMode.value = true;
      dialogVisible.value = true;
      Object.assign(form, {
        id: row.id,
        name: row.name,
        code: row.code,
        price: row.price,
        stock: row.stock,
        status: row.status,
        description: row.description
      });
    };

    // 删除商品
    const handleDelete = (row) => {
      ElMessageBox.confirm(
          `确定要删除商品 "${row.name}" 吗？`,
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
          ElMessage.error('删除出错');
        }
      }).catch(() => {
        // 用户取消删除
      });
    };

    // 提交商品（新增或编辑）
    const submitProduct = async () => {
      if (!productFormRef.value) return;

      await productFormRef.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true;
          try {
            let result;
            if (isEditMode.value) {
              result = await productService.updateProduct(form);
            } else {
              result = await productService.createProduct(form);
            }

            if (result.code === 0) {
              ElMessage.success(`${isEditMode.value ? '更新' : '创建'}成功`);
              dialogVisible.value = false;
              fetchProducts();
            } else {
              ElMessage.error(result.msg || `${isEditMode.value ? '更新' : '创建'}失败`);
            }
          } catch (error) {
            ElMessage.error(`${isEditMode.value ? '更新' : '创建'}出错`);
          } finally {
            submitLoading.value = false;
          }
        }
      });
    };

    // 关闭对话框时的清理工作
    const handleDialogClose = () => {
      if (productFormRef.value) {
        productFormRef.value.resetFields();
      }
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
      dialogVisible,
      isEditMode,
      searchForm,
      pagination,
      form,
      productRules,
      dialogTitle,
      productFormRef,
      fetchProducts,
      searchProducts,
      resetSearch,
      handleAdd,
      handleEdit,
      handleDelete,
      submitProduct,
      handleDialogClose,
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

.dialog-footer {
  text-align: right;
}
</style>
