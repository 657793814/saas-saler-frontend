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

                <!-- 批量新增规格值按钮 -->
                <el-button
                    type="success"
                    size="small"
                    @click="openBatchAddDialog(props.row)"
                    style="margin-left: 10px;"
                >
                  批量新增
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

        <!--        <el-table-column prop="specTypeId" label="ID" width="80"/>-->
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

    <!-- 新增/编辑规格对话框 -->
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
          label-width="120px"
      >
        <el-form-item label="规格名称" prop="specTypeName">
          <el-input v-model="form.specTypeName" placeholder="请输入规格名称"/>
        </el-form-item>

        <el-form-item label="规格值" prop="specValues">
          <div class="spec-values-input-container">
            <!-- 批量输入规格值 -->
            <el-input
                v-model="batchSpecValues"
                type="textarea"
                :rows="4"
                placeholder="请输入规格值，多个值请用逗号、分号或换行分隔。输入完成后先点解析，再点添加"
                style="margin-bottom: 10px;"
            />
            <div style="margin-bottom: 10px;">
              <el-button type="primary" size="small" @click="parseBatchSpecValues">
                解析规格值
              </el-button>
              <el-button type="success" size="small" @click="addParsedValues" :disabled="parsedSpecValues.length === 0">
                添加解析值
              </el-button>
            </div>

            <!-- 已添加的规格值 -->
            <div class="added-spec-values">
              <el-tag
                  v-for="(value, index) in form.specValues"
                  :key="index"
                  closable
                  @close="removeSpecValue(index)"
                  class="spec-value-tag"
              >
                {{ value.specValue }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSpecification" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量新增规格值对话框 -->
    <el-dialog
        title="批量新增规格值"
        v-model="batchAddDialogVisible"
        width="600px"
        @close="handleBatchAddDialogClose"
    >
      <el-form>
        <el-form-item label="规格类型">
          <el-input v-model="currentSpecType.specTypeName" disabled/>
        </el-form-item>
        <el-form-item label="批量新增">
          <div class="spec-values-input-container">
            <!-- 批量输入规格值 -->
            <el-input
                v-model="batchAddSpecValues"
                type="textarea"
                :rows="4"
                placeholder="请输入规格值，多个值请用逗号、分号或换行分隔。输入完成后先点解析，再点添加"
                style="margin-bottom: 10px;"
            />
            <div style="margin-bottom: 10px;">
              <el-button type="primary" size="small" @click="parseBatchAddSpecValues">
                解析规格值
              </el-button>
              <el-button
                  type="success"
                  size="small"
                  @click="addParsedBatchValues"
                  :disabled="parsedBatchSpecValues.length === 0">
                添加解析值
              </el-button>
            </div>

            <!-- 已添加的规格值 -->
            <div class="added-spec-values">
              <el-tag
                  v-for="(value, index) in batchAddSpecValueList"
                  :key="index"
                  closable
                  @close="removeBatchSpecValue(index)"
                  class="spec-value-tag"
              >
                {{ value.specValue }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAddDialogVisible = false">取消</el-button>
          <el-button
              type="primary"
              @click="submitBatchAddSpecValues"
              :loading="batchAddLoading"
              :disabled="batchAddSpecValueList.length === 0">
            确定
          </el-button>
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
    const newSpecValue = ref(''); // 新增规格值输入框
    const availableSpecValues = ref([]); // 可选的规格值
    const newSpecValueInputs = ref({}); // 每个规格类型的新增规格值输入框
    const addValueLoading = ref({}); // 每个规格类型新增规格值的加载状态

    // 批量新增相关
    const batchAddDialogVisible = ref(false);
    const currentSpecType = ref({});
    const batchAddSpecValues = ref(''); // 批量输入的规格值
    const batchAddLoading = ref(false);
    const parsedBatchSpecValues = ref([]); // 解析后的规格值
    const batchAddSpecValueList = ref([]); // 已添加的规格值列表

    // 批量输入相关
    const batchSpecValues = ref(''); // 批量输入的规格值
    const parsedSpecValues = ref([]); // 解析后的规格值

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
        {required: true, message: '请添加至少一个规格值', trigger: 'change'},
        {validator: validateSpecValues, trigger: 'change'}
      ]
    };

    // 自定义验证规则：确保至少有一个规格值
    function validateSpecValues(rule, value, callback) {
      if (!value || value.length === 0) {
        callback(new Error('请添加至少一个规格值'));
      } else {
        callback();
      }
    }

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
      batchSpecValues.value = '';
      parsedSpecValues.value = [];
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

    // 解析批量输入的规格值
    const parseBatchSpecValues = () => {
      if (!batchSpecValues.value) {
        ElMessage.warning('请输入规格值');
        return;
      }

      // 使用正则表达式分割规格值（支持逗号、分号、换行符）
      const values = batchSpecValues.value
          .split(/[,，;；\n\r]+/)
          .map(value => value.trim())
          .filter(value => value !== '');

      if (values.length === 0) {
        ElMessage.warning('未解析到有效的规格值');
        return;
      }

      parsedSpecValues.value = values;
      ElMessage.success(`成功解析 ${values.length} 个规格值`);
    };

    // 添加解析的规格值到表单
    const addParsedValues = () => {
      if (parsedSpecValues.value.length === 0) {
        ElMessage.warning('没有可添加的规格值');
        return;
      }

      // 过滤掉已存在的规格值
      const newValues = parsedSpecValues.value.filter(value => {
        return !form.specValues.some(item => item.specValue === value);
      });

      if (newValues.length === 0) {
        ElMessage.warning('所有规格值都已存在');
        return;
      }

      // 添加新规格值
      newValues.forEach(value => {
        form.specValues.push({specValue: value});
      });

      // 清空解析结果
      parsedSpecValues.value = [];
      batchSpecValues.value = '';

      ElMessage.success(`成功添加 ${newValues.length} 个新规格值`);
    };

    // 提交规格（新增或编辑）
    const submitSpecification = async () => {
      if (!specFormRef.value) return;

      await specFormRef.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true;
          try {
            let result;
            if (isEditMode.value) {
              // 编辑规格，目前去掉编辑，编辑在列表单个操作
              //result = await specService.updateSpecification(form);
            } else {
              // 新增规格
              result = await specService.createSpecification(form);
            }

            if (result.code === 0) {
              ElMessage.success(`${isEditMode.value ? '更新' : '创建'}成功`);
              dialogVisible.value = false;
              await fetchSpecifications();
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
      newSpecValue.value = '';
      batchSpecValues.value = '';
      parsedSpecValues.value = [];
    };

    // 打开批量新增规格值对话框
    const openBatchAddDialog = (specType) => {
      currentSpecType.value = specType;
      batchAddSpecValues.value = '';
      batchAddSpecValueList.value = [];
      parsedBatchSpecValues.value = [];
      batchAddDialogVisible.value = true;
    };

    // 解析批量新增规格值
    const parseBatchAddSpecValues = () => {
      if (!batchAddSpecValues.value) {
        ElMessage.warning('请输入规格值');
        return;
      }

      // 使用正则表达式分割规格值（支持逗号、分号、换行符）
      const values = batchAddSpecValues.value
          .split(/[,，;；\n\r]+/)
          .map(value => value.trim())
          .filter(value => value !== '');

      if (values.length === 0) {
        ElMessage.warning('未解析到有效的规格值');
        return;
      }

      parsedBatchSpecValues.value = values;
      ElMessage.success(`成功解析 ${values.length} 个规格值`);
    };

    // 添加解析的批量规格值到列表
    const addParsedBatchValues = () => {
      if (parsedBatchSpecValues.value.length === 0) {
        ElMessage.warning('没有可添加的规格值');
        return;
      }

      // 过滤掉已存在的规格值
      const newValues = parsedBatchSpecValues.value.filter(value => {
        return !batchAddSpecValueList.value.some(item => item.specValue === value);
      });

      if (newValues.length === 0) {
        ElMessage.warning('所有规格值都已存在');
        return;
      }

      // 添加新规格值，保持 [{specValue: "12"}, {specValue: "13"}] 格式
      newValues.forEach(value => {
        batchAddSpecValueList.value.push({specValue: value});
      });

      // 清空解析结果
      parsedBatchSpecValues.value = [];
      batchAddSpecValues.value = '';

      ElMessage.success(`成功添加 ${newValues.length} 个新规格值`);
    };

    // 移除批量新增的规格值
    const removeBatchSpecValue = (index) => {
      batchAddSpecValueList.value.splice(index, 1);
    };

    // 提交批量新增规格值
    const submitBatchAddSpecValues = async () => {
      if (batchAddSpecValueList.value.length === 0) {
        ElMessage.warning('请添加至少一个规格值');
        return;
      }

      try {
        batchAddLoading.value = true;

        // 调用批量新增接口，保持与新增规格类型相同的格式
        const result = await specService.batchAddSpecValues({
          specTypeId: currentSpecType.value.specTypeId,
          specValues: batchAddSpecValueList.value // 保持 [{specValue: "12"}, {specValue: "13"}] 格式
        });

        if (result.code === 0) {
          ElMessage.success(`成功新增 ${result.data.successCount} 个规格值`);
          batchAddDialogVisible.value = false;
          // 清空数据
          batchAddSpecValueList.value = [];
          batchAddSpecValues.value = '';
          parsedBatchSpecValues.value = [];
          await fetchSpecifications();
        } else {
          ElMessage.error(result.msg || '批量新增规格值失败');
        }
      } catch (error) {
        ElMessage.error('批量新增规格值出错');
      } finally {
        batchAddLoading.value = false;
      }
    };

    // 关闭批量新增对话框时的清理工作
    const handleBatchAddDialogClose = () => {
      batchAddSpecValueList.value = [];
      batchAddSpecValues.value = '';
      parsedBatchSpecValues.value = [];
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
      handleCurrentChange,
      submitSpecification,

      // 批量新增相关
      batchAddDialogVisible,
      currentSpecType,
      batchAddSpecValues,
      batchAddLoading,
      batchAddSpecValueList,
      parsedBatchSpecValues,
      openBatchAddDialog,
      submitBatchAddSpecValues,
      parseBatchAddSpecValues,
      addParsedBatchValues,
      removeBatchSpecValue,
      handleBatchAddDialogClose,

      // 批量输入相关
      batchSpecValues,
      parsedSpecValues,
      parseBatchSpecValues,
      addParsedValues
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

.spec-values-input-container {
  width: 100%;
}

.added-spec-values {
  margin-top: 10px;
}

.spec-value-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>