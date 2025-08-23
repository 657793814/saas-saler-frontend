<!-- src/views/products/Specifications.vue -->
<template>
  <div class="specifications">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>规格设置</span>
          <el-button type="primary" @click="handleAdd">新增规格</el-button>
        </div>
      </template>

      <!-- 规格列表 -->
      <el-table :data="specifications" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="name" label="规格名称" width="180"/>
        <el-table-column prop="values" label="规格值">
          <template #default="scope">
            <el-tag
                v-for="value in scope.row.values"
                :key="value"
                style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ value }}
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

    <!-- 规格编辑对话框 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="600px"
        @close="handleDialogClose"
    >
      <el-form
          :model="form"
          :rules="specRules"
          ref="specFormRef"
          label-width="100px"
      >
        <el-form-item label="规格名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入规格名称"/>
        </el-form-item>
        <el-form-item label="规格值" prop="values">
          <el-select
              v-model="form.values"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请输入规格值，可创建新值"
              style="width: 100%"
          >
            <el-option
                v-for="item in form.values"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
          <div class="form-tip">输入规格值后按回车确认，可添加多个规格值</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSpec" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {computed, onMounted, reactive, ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import specService from '@/utils/specService';

export default {
  name: 'SpecificationsManage',
  setup() {
    const specifications = ref([]);
    const loading = ref(false);
    const submitLoading = ref(false);
    const dialogVisible = ref(false);
    const isEditMode = ref(false);
    const specFormRef = ref(null);

    // 分页
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    });

    // 规格表单
    const form = reactive({
      id: null,
      name: '',
      values: []
    });

    // 表单验证规则
    const specRules = {
      name: [
        {required: true, message: '请输入规格名称', trigger: 'blur'}
      ],
      values: [
        {required: true, message: '请添加至少一个规格值', trigger: 'change'}
      ]
    };

    const dialogTitle = computed(() => {
      return isEditMode.value ? '编辑规格' : '新增规格';
    });

    // 获取规格列表
    const fetchSpecifications = async () => {
      loading.value = true;
      try {
        const params = {
          page: pagination.currentPage,
          size: pagination.pageSize
        };

        const result = await specService.getSpecifications(params);
        if (result.code === 0) {
          specifications.value = result.data.list || [];
          pagination.total = result.data.total || 0;
        } else {
          ElMessage.error(result.msg || '获取规格列表失败');
        }
      } catch (error) {
        ElMessage.error('获取规格列表出错');
      } finally {
        loading.value = false;
      }
    };

    // 新增规格
    const handleAdd = () => {
      isEditMode.value = false;
      dialogVisible.value = true;
      // 重置表单
      Object.assign(form, {
        id: null,
        name: '',
        values: []
      });
    };

    // 编辑规格
    const handleEdit = (row) => {
      isEditMode.value = true;
      dialogVisible.value = true;
      Object.assign(form, {
        id: row.id,
        name: row.name,
        values: [...row.values]  // 创建副本避免引用问题
      });
    };

    // 删除规格
    const handleDelete = (row) => {
      ElMessageBox.confirm(
          `确定要删除规格 "${row.name}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(async () => {
        try {
          const result = await specService.deleteSpecification(row.id);
          if (result.code === 0) {
            ElMessage.success('删除成功');
            fetchSpecifications();
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

    // 提交规格（新增或编辑）
    const submitSpec = async () => {
      if (!specFormRef.value) return;

      await specFormRef.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true;
          try {
            let result;
            if (isEditMode.value) {
              result = await specService.updateSpecification(form);
            } else {
              result = await specService.createSpecification(form);
            }

            if (result.code === 0) {
              ElMessage.success(`${isEditMode.value ? '更新' : '创建'}成功`);
              dialogVisible.value = false;
              fetchSpecifications();
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
      if (specFormRef.value) {
        specFormRef.value.resetFields();
      }
    };

    // 分页相关方法
    const handleSizeChange = (val) => {
      pagination.pageSize = val;
      fetchSpecifications();
    };

    const handleCurrentChange = (val) => {
      pagination.currentPage = val;
      fetchSpecifications();
    };

    onMounted(() => {
      fetchSpecifications();
    });

    return {
      specifications,
      loading,
      submitLoading,
      dialogVisible,
      isEditMode,
      pagination,
      form,
      specRules,
      dialogTitle,
      specFormRef,
      fetchSpecifications,
      handleAdd,
      handleEdit,
      handleDelete,
      submitSpec,
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
