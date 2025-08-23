<!-- src/views/system/RoleManagement.vue -->
<template>
  <div class="role-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.name" placeholder="角色名称" clearable/>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.enable" class="search-select" placeholder="请选择状态" clearable>
              <el-option label="启用" :value="1"/>
              <el-option label="禁用" :value="0"/>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchRoles">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="roles" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="角色ID" width="180"/>
        <el-table-column prop="name" label="角色名称" width="180"/>
        <el-table-column prop="desc" label="角色描述"/>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.enable === 1 ? 'success' : 'danger'">
              {{ scope.row.enable === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <!-- 对于 admin 角色不显示启用/禁用开关 -->
            <template v-if="scope.row.name !== 'admin'">
              <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-switch
                  :model-value="scope.row.enable"
                  :active-value="1"
                  :inactive-value="0"
                  active-text="启用"
                  inactive-text="禁用"
                  @change="(val) => toggleRoleStatus(scope.row, val)"
                  style="margin-left: 10px"
              />
            </template>
            <template v-else>
              <span style="margin-left: 10px; color: #909399; font-size: 12px;">系统角色</span>
            </template>
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

    <!-- 角色编辑对话框 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="500px"
        @close="handleDialogClose"
    >
      <el-form
          :model="form"
          :rules="roleRules"
          ref="roleForm"
          label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input
              v-model="form.name"
              :disabled="isEditMode"
              placeholder="请输入角色名称"
          />
        </el-form-item>
        <el-form-item label="角色描述" prop="desc">
          <el-input
              v-model="form.desc"
              type="textarea"
              placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="enable">
          <el-radio-group v-model="form.enable" :disabled="isEditMode && form.name === 'admin'">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRole" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {computed, onMounted, reactive, ref} from 'vue';
import {ElMessage} from 'element-plus';
import roleService from '@/utils/roleService';

export default {
  name: 'RoleManagement',
  setup() {
    const roles = ref([]);
    const loading = ref(false);
    const submitLoading = ref(false);
    const dialogVisible = ref(false);
    const isEditMode = ref(false);
    const roleForm = ref(null);
    const isInitializing = ref(true); // 添加初始化状态标记

    // 搜索表单
    const searchForm = reactive({
      name: '',
      enable: undefined  // 改为 undefined 而不是 null
    });

    // 分页
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    });

    const form = reactive({
      id: null,
      name: '',
      desc: '',
      enable: 1
    });

    const roleRules = {
      name: [
        {required: true, message: '请输入角色名称', trigger: 'blur'}
      ],
      desc: [
        {required: true, message: '请输入角色描述', trigger: 'blur'}
      ]
    };

    const dialogTitle = computed(() => {
      return isEditMode.value ? '编辑角色' : '新增角色';
    });

    // 获取角色列表
    const fetchRoles = async () => {
      loading.value = true;
      try {
        const params = {
          current: pagination.currentPage,
          size: pagination.pageSize,
          name: searchForm.name,
          enable: searchForm.enable !== undefined ? (searchForm.enable === 1 ? true : false) : null  // 处理 undefined 值
        };

        const result = await roleService.getRoles(params);
        if (result.code === 0) {
          roles.value = result.data.records || [];
          pagination.total = result.data.total || 0;
        } else {
          ElMessage.error(result.msg || '获取角色列表失败');
        }
      } catch (error) {
        ElMessage.error('获取角色列表出错');
      } finally {
        loading.value = false;
        // 初始化完成后设置标记
        if (isInitializing.value) {
          setTimeout(() => {
            isInitializing.value = false;
          }, 100);
        }
      }
    };

    // 搜索角色
    const searchRoles = () => {
      pagination.currentPage = 1;
      fetchRoles();
    };

    // 重置搜索
    const resetSearch = () => {
      searchForm.name = '';
      searchForm.enable = undefined;  // 重置为 undefined
      pagination.currentPage = 1;
      fetchRoles();
    };

    // 新增角色
    const handleAdd = () => {
      isEditMode.value = false;
      dialogVisible.value = true;
      // 重置表单
      Object.assign(form, {
        id: null,
        name: '',
        desc: '',
        enable: 1
      });
    };

    // 编辑角色
    const handleEdit = (row) => {
      isEditMode.value = true;
      dialogVisible.value = true;
      Object.assign(form, {
        id: row.id,
        name: row.name,
        desc: row.desc,
        enable: row.enable
      });
    };

    // 切换角色状态
    const toggleRoleStatus = async (row, enable) => {
      // 在初始化过程中不处理状态切换
      if (isInitializing.value) {
        return;
      }

      // 避免状态未改变时触发
      if (row.enable === enable) {
        return;
      }

      // 禁止修改 admin 角色状态
      if (row.name === 'admin') {
        ElMessage.warning('不能修改系统管理员角色状态');
        return;
      }

      const originalStatus = row.enable; // 保存原始状态
      row.enable = enable; // 先更新状态以优化用户体验

      try {
        const result = await roleService.updateRole({
          id: row.id,
          name: row.name,
          desc: row.desc,
          enable: enable
        });

        if (result.code !== 0) {
          row.enable = originalStatus; // 失败则回滚状态
          ElMessage.error(result.msg || '更新角色状态失败');
        } else {
          ElMessage.success(`${enable === 1 ? '启用' : '禁用'}角色成功`);
        }
      } catch (error) {
        row.enable = originalStatus; // 异常也回滚状态
        ElMessage.error('更新角色状态出错');
      }
    };

    // 提交角色（新增或编辑）
    const submitRole = async () => {
      if (!roleForm.value) return;

      // 禁止修改 admin 角色
      if (isEditMode.value && form.name === 'admin') {
        ElMessage.warning('不能修改系统管理员角色');
        return;
      }

      await roleForm.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true;
          try {
            let result;
            if (isEditMode.value) {
              result = await roleService.updateRole(form);
            } else {
              result = await roleService.createRole(form);
            }

            if (result.code === 0) {
              ElMessage.success(`${isEditMode.value ? '更新' : '创建'}角色成功`);
              dialogVisible.value = false;
              await fetchRoles();
            } else {
              ElMessage.error(result.msg || `${isEditMode.value ? '更新' : '创建'}角色失败`);
            }
          } catch (error) {
            ElMessage.error(`${isEditMode.value ? '更新' : '创建'}角色出错`);
          } finally {
            submitLoading.value = false;
          }
        }
      });
    };

    // 关闭对话框时的清理工作
    const handleDialogClose = () => {
      if (roleForm.value) {
        roleForm.value.resetFields();
      }
    };

    // 分页相关方法
    const handleSizeChange = (val) => {
      pagination.pageSize = val;
      fetchRoles();
    };

    const handleCurrentChange = (val) => {
      pagination.currentPage = val;
      fetchRoles();
    };

    onMounted(() => {
      fetchRoles();
    });

    return {
      roles,
      loading,
      submitLoading,
      dialogVisible,
      isEditMode,
      searchForm,
      pagination,
      form,
      roleRules,
      dialogTitle,
      roleForm,
      fetchRoles,
      searchRoles,
      resetSearch,
      handleAdd,
      handleEdit,
      toggleRoleStatus,
      submitRole,
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

.search-select {
  width: 100px;
}

</style>
