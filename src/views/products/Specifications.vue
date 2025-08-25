<template>
  <div class="specifications">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>规格设置</span>
          <el-button type="primary" @click="handleAdd">新增规格</el-button>
        </div>
      </template>

      <!-- 查询条件 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="规格名称">
            <el-input
                v-model="searchForm.name"
                placeholder="请输入规格名称"
                clearable
                @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 规格列表 -->
      <el-table :data="specifications" style="width: 100%" v-loading="loading" border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template #default="props">
            <div class="spec-values-container">
              <!-- 新增规格值表单 -->
              <div class="add-spec-value-form">
                <el-input
                    v-model="newSpecValueInputs[props.row.specTypeId]"
                    placeholder="请输入新的规格值"
                    style="width: 200px; margin-right: 10px;"
                    @keyup.enter="addSpecValueToType(props.row)"
                />
                <el-button
                    type="primary"
                    size="small"
                    @click="addSpecValueToType(props.row)"
                    :loading="addValueLoading[props.row.specTypeId]"
                >
                  新增规格值
                </el-button>
              </div>

              <!-- 规格值列表 -->
              <el-table
                  :data="props.row.specValues"
                  style="width: 100%"
                  :show-header="false"
                  class="nested-table"
              >
                <el-table-column prop="specValue" label="规格值" width="200"/>
                <el-table-column label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.enable === 1 ? 'success' : 'info'">
                      {{ scope.row.enable === 1 ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button
                        v-if="scope.row.enable === 1"
                        size="small"
                        type="warning"
                        @click="toggleSpecValueStatus(scope.row, 0, props.row.specTypeId)"
                    >
                      禁用
                    </el-button>
                    <el-button
                        v-else
                        size="small"
                        type="success"
                        @click="toggleSpecValueStatus(scope.row, 1, props.row.specTypeId)"
                    >
                      启用
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="specTypeId" label="ID" width="80"/>
        <el-table-column prop="specTypeName" label="规格名称" width="180"/>
        <el-table-column label="规格值数量" width="120">
          <template #default="scope">
            {{ scope.row.specValues ? scope.row.specValues.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.enable === 1 ? 'success' : 'info'">
              {{ scope.row.enable === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
                v-if="scope.row.enable === 1"
                size="small"
                type="warning"
                @click="toggleSpecTypeStatus(scope.row)"
            >
              禁用
            </el-button>
            <el-button
                v-else
                size="small"
                type="success"
                @click="toggleSpecTypeStatus(scope.row)"
            >
              启用
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
    const newSpecValue = ref(''); // 新增规格值输入框
    const availableSpecValues = ref([]); // 可选的规格值
    const newSpecValueInputs = ref({}); // 每个规格类型的新增规格值输入框
    const addValueLoading = ref({}); // 每个规格类型新增规格值的加载状态

    // 查询表单
    const searchForm = reactive({
      name: ''
    });

    // 分页
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    });

    // 规格表单
    const form = reactive({
      specTypeId: null,
      specTypeName: '',
      specValues: []
    });

    // 表单验证规则
    const specRules = {
      specTypeName: [
        {required: true, message: '请输入规格名称', trigger: 'blur'}
      ],
      specValues: [
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
          current: pagination.currentPage,
          size: pagination.pageSize
        };

        // 添加查询条件
        if (searchForm.name && searchForm.name.trim() !== '') {
          params.name = searchForm.name.trim();
        }

        const result = await specService.getSpecDataPage(params);
        if (result.code === 0) {
          specifications.value = result.data.records || [];
          pagination.total = result.data.total || 0;

          // 初始化每个规格类型的新增规格值输入框
          specifications.value.forEach(spec => {
            newSpecValueInputs.value[spec.specTypeId] = '';
          });
        } else {
          ElMessage.error(result.msg || '获取规格列表失败');
        }
      } catch (error) {
        ElMessage.error('获取规格列表出错');
      } finally {
        loading.value = false;
      }
    };

    // 查询
    const handleSearch = () => {
      pagination.currentPage = 1; // 查询时重置到第一页
      fetchSpecifications();
    };

    // 重置查询条件
    const handleReset = () => {
      searchForm.name = '';
      pagination.currentPage = 1;
      fetchSpecifications();
    };

    // 切换规格类型状态（启用/禁用）
    const toggleSpecTypeStatus = (row) => {
      const action = row.enable === 1 ? '禁用' : '启用';
      ElMessageBox.confirm(
          `确定要${action}规格 "${row.specTypeName}" 吗？`,
          '确认操作',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(async () => {
        try {
          const newStatus = row.enable === 1 ? 0 : 1;
          const result = await specService.updateSpecTypeStatus({specTypeId: row.specTypeId, enable: newStatus});
          if (result.code === 0) {
            ElMessage.success(`${action}成功`);
            await fetchSpecifications();
          } else {
            ElMessage.error(result.msg || `${action}失败`);
          }
        } catch (error) {
          ElMessage.error(`${action}出错`);
        }
      }).catch(() => {
        // 用户取消操作
      });
    };

    // 新增规格
    const handleAdd = () => {
      isEditMode.value = false;
      dialogVisible.value = true;
      // 重置表单
      Object.assign(form, {
        specTypeId: null,
        specTypeName: '',
        specValues: []
      });
      newSpecValue.value = '';
    };

    // 删除规格
    const handleDelete = (row) => {
      ElMessageBox.confirm(
          `确定要删除规格 "${row.specTypeName}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(async () => {
        try {
          const result = await specService.deleteSpecification(row.specTypeId);
          if (result.code === 0) {
            ElMessage.success('删除成功');
            await fetchSpecifications();
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

    // 切换规格值状态（启用/禁用）
    const toggleSpecValueStatus = async (specValue, status, specTypeId) => {
      const action = status === 1 ? '启用' : '禁用';
      try {
        const result = await specService.updateSpecValueStatus({specValueId: specValue.specId, enable: status});
        if (result.code === 0) {
          ElMessage.success(`${action}成功`);
          // 更新本地数据
          const spec = specifications.value.find(s => s.specTypeId === specTypeId);
          if (spec) {
            const value = spec.specValues.find(v => v.specId === specValue.specId);
            if (value) {
              value.enable = status;
            }
          }
        } else {
          ElMessage.error(result.msg || `${action}失败`);
        }
      } catch (error) {
        ElMessage.error(`${action}出错`);
      }
    };

    // 为指定规格类型新增规格值
    const addSpecValueToType = async (specType) => {
      const inputValue = newSpecValueInputs.value[specType.specTypeId];
      if (!inputValue || inputValue.trim() === '') {
        ElMessage.warning('请输入规格值');
        return;
      }

      // 检查是否已存在
      const exists = specType.specValues.some(item => item.specValue === inputValue.trim());
      if (exists) {
        ElMessage.warning('该规格值已存在');
        return;
      }

      try {
        // 设置加载状态
        addValueLoading.value[specType.specTypeId] = true;

        const result = await specService.addSpecValueToType({
          specTypeId: specType.specTypeId,
          specValue: inputValue.trim()
        });

        if (result.code === 0) {
          ElMessage.success('新增规格值成功');
          // 清空输入框
          newSpecValueInputs.value[specType.specTypeId] = '';
          // 刷新列表
          await fetchSpecifications();
        } else {
          ElMessage.error(result.msg || '新增规格值失败');
        }
      } catch (error) {
        ElMessage.error('新增规格值出错');
      } finally {
        addValueLoading.value[specType.specTypeId] = false;
      }
    };

    // 添加规格值（用于新增/编辑规格对话框）
    const addSpecValue = () => {
      if (newSpecValue.value.trim() !== '') {
        // 检查是否已存在
        const exists = form.specValues.some(item => item.specValue === newSpecValue.value.trim());
        if (!exists) {
          form.specValues.push({
            specValue: newSpecValue.value.trim()
          });
        }
        newSpecValue.value = '';
      }
    };

    // 移除规格值（用于新增/编辑规格对话框）
    const removeSpecValue = (index) => {
      form.specValues.splice(index, 1);
    };

    // 关闭对话框时的清理工作
    const handleDialogClose = () => {
      if (specFormRef.value) {
        specFormRef.value.resetFields();
      }
      newSpecValue.value = '';
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
      newSpecValue,
      availableSpecValues,
      newSpecValueInputs,
      addValueLoading,
      searchForm,
      fetchSpecifications,
      handleSearch,
      handleReset,
      toggleSpecTypeStatus,
      handleAdd,
      handleDelete,
      toggleSpecValueStatus,
      addSpecValueToType,
      addSpecValue,
      removeSpecValue,
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

.search-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
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

.nested-table {
  background-color: #f5f7fa;
  margin-top: 10px;
}

.spec-values-container {
  padding: 10px 20px;
}

.add-spec-value-form {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f2f5;
  border-radius: 4px;
}
</style>