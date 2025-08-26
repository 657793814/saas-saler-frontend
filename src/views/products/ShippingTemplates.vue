<!-- src/views/products/ShippingTemplates.vue -->
<template>
  <div class="shipping-templates">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>运费模板</span>
          <el-button type="primary" @click="handleAdd">新增模板</el-button>
        </div>
      </template>

      <!-- 模板列表 -->
      <el-table :data="templates" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="templateName" label="模板名称" width="180"/>
        <el-table-column prop="valuationType" label="计费方式" width="120">
          <template #default="scope">
            {{ scope.row.valuationType === 1 ? '按件数' : '按重量' }}
          </template>
        </el-table-column>
        <el-table-column prop="firstFee" label="首费" width="120">
          <template #default="scope">
            ¥{{ scope.row.firstFee }}
          </template>
        </el-table-column>
        <el-table-column prop="additionalFee" label="续费" width="120">
          <template #default="scope">
            ¥{{ scope.row.additionalFee }}
          </template>
        </el-table-column>
        <el-table-column prop="freeShippingAmount" label="包邮金额" width="120">
          <template #default="scope">
            <span v-if="scope.row.freeShippingAmount">¥{{ scope.row.freeShippingAmount }}</span>
            <span v-else>不包邮</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
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

    <!-- 模板编辑对话框 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="600px"
        @close="handleDialogClose"
    >
      <el-form
          :model="form"
          :rules="templateRules"
          ref="templateFormRef"
          label-width="120px"
      >
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入模板名称"/>
        </el-form-item>
        <el-form-item label="计费方式" prop="valuationType">
          <el-radio-group v-model="form.valuationType">
            <el-radio :label="1">按件数计费</el-radio>
            <el-radio :label="2">按重量计费</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="首费" prop="firstFee">
          <el-input v-model.number="form.firstFee" placeholder="请输入首费">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="续费" prop="additionalFee">
          <el-input v-model.number="form.additionalFee" placeholder="请输入续费">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="包邮金额" prop="freeShippingAmount">
          <el-input v-model.number="form.freeShippingAmount" placeholder="请输入包邮金额(留空表示不包邮)">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
              v-model="form.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTemplate" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {computed, onMounted, reactive, ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import shippingService from '@/utils/shippingService';

export default {
  name: 'ShippingTemplates',
  setup() {
    const templates = ref([]);
    const loading = ref(false);
    const submitLoading = ref(false);
    const dialogVisible = ref(false);
    const isEditMode = ref(false);
    const templateFormRef = ref(null);

    // 分页
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    });

    // 模板表单
    const form = reactive({
      id: null,
      templateName: '',
      valuationType: 1, // 1: 按件数, 2: 按重量
      firstFee: 0,
      additionalFee: 0,
      freeShippingAmount: null,
      status: 1 // 1: 启用, 0: 禁用
    });

    // 表单验证规则
    const templateRules = {
      templateName: [
        {required: true, message: '请输入模板名称', trigger: 'blur'}
      ],
      valuationType: [
        {required: true, message: '请选择计费方式', trigger: 'change'}
      ],
      firstFee: [
        {required: true, message: '请输入首费', trigger: 'blur'},
        {type: 'number', message: '首费必须为数字', trigger: 'blur'}
      ],
      additionalFee: [
        {required: true, message: '请输入续费', trigger: 'blur'},
        {type: 'number', message: '续费必须为数字', trigger: 'blur'}
      ]
    };

    const dialogTitle = computed(() => {
      return isEditMode.value ? '编辑运费模板' : '新增运费模板';
    });

    // 获取模板列表
    const fetchTemplates = async () => {
      loading.value = true;
      try {
        const params = {
          current: pagination.currentPage,
          size: pagination.pageSize
        };

        const result = await shippingService.getTemplates(params);
        if (result.code === 0) {
          templates.value = result.data.records || [];
          pagination.total = result.data.total || 0;
          pagination.currentPage = result.data.current || 1;
          pagination.pageSize = result.data.size || 10;
        } else {
          ElMessage.error(result.msg || '获取模板列表失败');
        }
      } catch (error) {
        ElMessage.error('获取模板列表出错');
      } finally {
        loading.value = false;
      }
    };

    // 新增模板
    const handleAdd = () => {
      isEditMode.value = false;
      dialogVisible.value = true;
      // 重置表单
      Object.assign(form, {
        id: null,
        templateName: '',
        valuationType: 1,
        firstFee: 0,
        additionalFee: 0,
        freeShippingAmount: null,
        status: 1
      });
    };

    // 编辑模板
    const handleEdit = (row) => {
      isEditMode.value = true;
      dialogVisible.value = true;
      Object.assign(form, {
        id: row.id,
        templateName: row.templateName,
        valuationType: row.valuationType,
        firstFee: row.firstFee,
        additionalFee: row.additionalFee,
        freeShippingAmount: row.freeShippingAmount,
        status: row.status
      });
    };

    // 删除模板
    const handleDelete = (row) => {
      ElMessageBox.confirm(
          `确定要删除运费模板 "${row.templateName}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(async () => {
        try {
          const result = await shippingService.deleteTemplate(row.id);
          if (result.code === 0) {
            ElMessage.success('删除成功');
            fetchTemplates();
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

    // 提交模板（新增或编辑）
    const submitTemplate = async () => {
      if (!templateFormRef.value) return;

      await templateFormRef.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true;
          try {
            // 处理表单数据
            const submitForm = {...form};
            if (submitForm.freeShippingAmount === '') {
              submitForm.freeShippingAmount = null;
            }

            let result;
            if (isEditMode.value) {
              result = await shippingService.updateTemplate(submitForm);
            } else {
              result = await shippingService.createTemplate(submitForm);
            }

            if (result.code === 0) {
              ElMessage.success(`${isEditMode.value ? '更新' : '创建'}成功`);
              dialogVisible.value = false;
              await fetchTemplates();
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
      if (templateFormRef.value) {
        templateFormRef.value.resetFields();
      }
    };

    // 分页相关方法
    const handleSizeChange = (val) => {
      pagination.pageSize = val;
      fetchTemplates();
    };

    const handleCurrentChange = (val) => {
      pagination.currentPage = val;
      fetchTemplates();
    };

    onMounted(() => {
      fetchTemplates();
    });

    return {
      templates,
      loading,
      submitLoading,
      dialogVisible,
      isEditMode,
      pagination,
      form,
      templateRules,
      dialogTitle,
      templateFormRef,
      fetchTemplates,
      handleAdd,
      handleEdit,
      handleDelete,
      submitTemplate,
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
</style>