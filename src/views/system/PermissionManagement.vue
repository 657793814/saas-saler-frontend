<!-- src/views/system/PermissionManagement.vue -->
<template>
  <div class="permission-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <el-button type="primary" @click="handleAdd">新增权限</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="权限名称">
            <el-input v-model="searchForm.name" placeholder="权限名称" clearable/>
          </el-form-item>
          <el-form-item label="权限标识">
            <el-input v-model="searchForm.code" placeholder="权限标识" clearable/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchPermissions">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 权限列表 -->
      <el-table
          :data="permissions"
          style="width: 100%"
          v-loading="loading"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          border
      >
        <el-table-column prop="name" label="权限名称" width="180">
          <template #default="scope">
            <span :style="{ paddingLeft: scope.row.level * 20 + 'px' }">
              {{ scope.row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="权限标识" width="180"/>
        <el-table-column prop="path" label="路径" width="180"/>
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="scope">
            <i v-if="scope.row.icon" :class="scope.row.icon"></i>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.enable === 1 ? 'success' : 'danger'">
              {{ scope.row.enable === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleAddChild(scope.row)">新增子权限</el-button>
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            <el-switch
                v-model="scope.row.enable"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
                @change="(val) => togglePermissionStatus(scope.row, val)"
                style="margin-left: 10px"
            />
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

    <!-- 权限编辑对话框 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="500px"
        @close="handleDialogClose"
    >
      <el-form
          :model="form"
          :rules="permissionRules"
          ref="permissionFormRef"
          label-width="100px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入权限名称"/>
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="form.code" placeholder="请输入权限标识"/>
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入路径"/>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标类名"/>
        </el-form-item>

        <el-form-item label="状态" prop="enable">
          <el-radio-group v-model="form.enable">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="父级权限" prop="parentCode">
          <el-select
              v-model="form.parentCode"
              placeholder="请选择父级权限"
              clearable
              style="width: 100%"
          >
            <el-option
                v-for="permission in parentPermissions"
                :key="permission.code"
                :label="permission.name"
                :value="permission.code"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPermission" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {computed, onMounted, reactive, ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import permissionService from '@/utils/permissionService';

export default {
  name: 'PermissionManagement',
  setup() {
    const permissions = ref([]);
    const parentPermissions = ref([]); // 用于父级权限下拉选择
    const loading = ref(false);
    const submitLoading = ref(false);
    const dialogVisible = ref(false);
    const isEditMode = ref(false);
    const permissionFormRef = ref(null);

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

    // 权限表单
    const form = reactive({
      id: 0,
      name: '',
      code: '',
      path: '',
      icon: '',
      enable: 1,
    });

    // 表单验证规则
    const permissionRules = {
      name: [
        {required: true, message: '请输入权限名称', trigger: 'blur'}
      ],
      code: [
        {required: true, message: '请输入权限标识', trigger: 'blur'}
      ],
      path: [
        {required: true, message: '请输入路径', trigger: 'blur'}
      ]
    };

    const dialogTitle = computed(() => {
      return isEditMode.value ? '编辑权限' : '新增权限';
    });

    // 获取权限列表
    const fetchPermissions = async () => {
      loading.value = true;
      try {
        const params = {
          current: pagination.currentPage,
          size: pagination.pageSize,
          name: searchForm.name,
          code: searchForm.code
        };

        const result = await permissionService.getPermissions(params);
        console.log('获取权限结果:', result);
        if (result.code === 0) {
          // 处理分页数据结构
          const records = result.data.records || [];
          pagination.total = result.data.total || 0;
          pagination.currentPage = result.data.current || 1;
          pagination.pageSize = result.data.size || 10;

          // 构建树形结构
          const treeData = buildTree(records);
          permissions.value = treeData;

          // 提取一级权限用于父级选择
          parentPermissions.value = records
              .filter(permission => !permission.parentCode || permission.parentCode === '')
              .map(permission => ({
                code: permission.code,
                name: permission.name
              }));
        } else {
          console.error('获取权限列表出错:', result.msg);
          ElMessage.error(result.msg || '获取权限列表失败');
        }
      } catch (error) {
        console.error('获取权限列表异常:', error);
        ElMessage.error('获取权限列表出错');
      } finally {
        loading.value = false;
      }
    };

    // 构建树形结构
    const buildTree = (flatData) => {
      if (!Array.isArray(flatData) || flatData.length === 0) return [];

      // 创建映射表
      const map = {};
      const roots = [];

      // 初始化所有节点
      flatData.forEach(item => {
        map[item.code] = {...item, children: []};
      });

      // 构建父子关系
      flatData.forEach(item => {
        const node = map[item.code];
        if (!item.parentCode || item.parentCode === '') {
          // 一级节点
          roots.push(node);
        } else {
          // 查找父节点
          const parent = map[item.parentCode];
          if (parent) {
            parent.children.push(node);
          }
        }
      });

      return roots;
    };


    // 搜索权限
    const searchPermissions = () => {
      pagination.currentPage = 1;
      fetchPermissions();
    };

    // 重置搜索
    const resetSearch = () => {
      searchForm.name = '';
      searchForm.code = '';
      pagination.currentPage = 1;
      fetchPermissions();
    };

    // 新增权限
    const handleAdd = () => {
      isEditMode.value = false;
      dialogVisible.value = true;
      // 重置表单
      Object.assign(form, {
        name: '',
        code: '',
        path: '',
        icon: '',
        enable: 1,
        parentCode: ''
      });
    };

    // 新增子权限
    const handleAddChild = (row) => {
      // 检查是否为一级权限（没有parentCode或parentCode为空）
      if (row.parentCode && row.parentCode !== '') {
        ElMessage.warning('二级权限不能新增子权限');
        return;
      }

      isEditMode.value = false;
      dialogVisible.value = true;
      // 重置表单，设置父级权限
      Object.assign(form, {
        name: '',
        code: '',
        path: '',
        icon: '',
        enable: 1,
        parentCode: row.code
      });
    };

    // 编辑权限
    const handleEdit = (row) => {
      isEditMode.value = true;
      dialogVisible.value = true;
      Object.assign(form, {
        id: row.id,
        name: row.name,
        code: row.code,
        path: row.path,
        icon: row.icon,
        enable: row.enable,
        parentCode: row.parentCode || ''
      });
    };

    // 切换权限状态
    const togglePermissionStatus = async (row, enable) => {
      const oriStatus = row.enable;
      try {
        const result = await permissionService.updatePermission({
          id: row.id,
          name: row.name,
          code: row.code,
          path: row.path,
          icon: row.icon,
          enable: enable,
          parentCode: row.parentCode
        });

        if (result.code === 0) {
          ElMessage.success(`${enable === 1 ? '启用' : '禁用'}权限成功`);
          row.enable = enable;
        } else {
          // 恢复状态
          row.enable = oriStatus;
          ElMessage.error(result.msg || '更新权限状态失败');
        }
      } catch (error) {
        // 恢复状态
        row.enable = oriStatus;
        ElMessage.error('更新权限状态出错');
      }
    };

    // 删除权限
    const handleDelete = (row) => {
      ElMessageBox.confirm(
          `确定要删除权限 "${row.name}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(async () => {
        try {
          const result = await permissionService.deletePermission({id: row.id});
          if (result.code === 0) {
            ElMessage.success('删除成功');
            fetchPermissions();
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

    // 提交权限（新增或编辑）
    const submitPermission = async () => {
      if (!permissionFormRef.value) return;

      await permissionFormRef.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true;
          try {
            let result;
            if (isEditMode.value) {
              result = await permissionService.updatePermission(form);
            } else {
              result = await permissionService.createPermission(form);
            }

            if (result.code === 0) {
              ElMessage.success(`${isEditMode.value ? '更新' : '创建'}成功`);
              dialogVisible.value = false;
              fetchPermissions();
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
      if (permissionFormRef.value) {
        permissionFormRef.value.resetFields();
      }
    };

    // 分页相关方法
    const handleSizeChange = (val) => {
      pagination.pageSize = val;
      fetchPermissions();
    };

    const handleCurrentChange = (val) => {
      pagination.currentPage = val;
      fetchPermissions();
    };

    onMounted(() => {
      fetchPermissions();
    });

    return {
      permissions,
      parentPermissions,
      loading,
      submitLoading,
      dialogVisible,
      isEditMode,
      searchForm,
      pagination,
      form,
      permissionRules,
      dialogTitle,
      permissionFormRef,
      fetchPermissions,
      searchPermissions,
      resetSearch,
      handleAdd,
      handleAddChild,
      handleEdit,
      togglePermissionStatus,
      handleDelete,
      submitPermission,
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
