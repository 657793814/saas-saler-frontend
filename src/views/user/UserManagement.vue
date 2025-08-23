<!-- src/views/UserManagement.vue -->
<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <!-- 用户列表 -->
      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="userCode" label="用户编码" width="180"/>
        <el-table-column prop="userName" label="用户名" width="180"/>
        <el-table-column prop="mobile" label="手机号" width="180"/>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.enable === 1 ? 'success' : 'danger'">
              {{ scope.row.enable === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-switch
                v-model="scope.row.enable"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
                @change="toggleUserStatus(scope.row)"
                style="margin-left: 10px"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="500px"
        @close="handleDialogClose"
    >
      <el-form
          :model="form"
          :rules="userRules"
          ref="userForm"
          label-width="100px"
      >
        <el-form-item label="用户编码" prop="userCode">
          <el-input
              v-model="form.userCode"
              :disabled="isEditMode"
              placeholder="请输入用户编码"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input
              v-model="form.userName"
              placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input
              v-model="form.mobile"
              placeholder="请输入手机号"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :required="!isEditMode"
          />
        </el-form-item>
        <el-form-item label="状态" prop="enable">
          <el-select v-model="form.enable" placeholder="请选择状态">
            <el-option :value="1" label="启用"/>
            <el-option :value="0" label="禁用"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUser" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {computed, onMounted, reactive, ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import apiRequest from '@/utils/request';
import CryptoJS from "crypto-js";

export default {
  name: 'UserManagement',
  setup() {
    const users = ref([]);
    const loading = ref(false);
    const submitLoading = ref(false);
    const dialogVisible = ref(false);
    const isEditMode = ref(false);
    const userForm = ref(null);
    let oriRow = {};

    // 用户表单
    const form = reactive({
      openid: '',
      userCode: '',
      userName: '',
      mobile: '',
      password: '',
      enable: 1
    });

    // 分页
    const pagination = reactive({
      total: 0,
      current: 1,
      size: 10,
      pages: 0
    });

    // 表单验证规则
    const userRules = {
      userCode: [
        {required: true, message: '请输入用户编码', trigger: 'blur'}
      ],
      userName: [
        {required: true, message: '请输入用户名', trigger: 'blur'}
      ],
      mobile: [
        {required: true, message: '请输入手机号', trigger: 'blur'}
      ],
      password: [
        {required: false, message: '请输入密码', trigger: 'blur'}
      ],
      enable: [
        {required: true, message: '请选择状态', trigger: 'change'}
      ]
    };

    const dialogTitle = computed(() => {
      return isEditMode.value ? '编辑用户' : '新增用户';
    });

    // 获取用户列表
    const fetchUsers = async () => {
      loading.value = true;
      try {
        const result = await apiRequest.post('/api/user/page', {
          current: pagination.current,
          size: pagination.size
        });

        if (result.code === 0) {
          users.value = result.data.records || [];
          pagination.total = result.data.total || 0;
          pagination.current = result.data.current || 1;
          pagination.size = result.data.size || 10;
          pagination.pages = Math.ceil(result.data.total / result.data.size) || 0;
        } else {
          ElMessage.error(result.msg || '获取用户列表失败');
        }
      } catch (error) {
        ElMessage.error('获取用户列表出错');
      } finally {
        loading.value = false;
      }
    };

    // 新增用户
    const handleAdd = () => {
      isEditMode.value = false;
      dialogVisible.value = true;
      // 重置表单
      Object.assign(form, {
        openid: '',
        userCode: '',
        userName: '',
        mobile: '',
        password: '',
        enable: 1
      });
    };

    // 编辑用户
    const handleEdit = (row) => {
      isEditMode.value = true;
      dialogVisible.value = true;
      oriRow = row;  //保存源数据，判断密码是否变更
      Object.assign(form, {
        openid: row.openid,
        userCode: row.userCode,
        userName: row.userName,
        mobile: row.mobile,
        password: row.password,
        enable: row.enable
      });
    };

    // 删除用户
    const handleDelete = (row) => {
      ElMessageBox.confirm(
          `确定要删除用户 "${row.userName}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(async () => {
        try {
          const result = await apiRequest.post('/api/user/delete', {
            openid: row.openid
          });
          if (result.code === 0) {
            ElMessage.success('删除成功');
            fetchUsers();
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

    // 切换用户状态
    const toggleUserStatus = async (row) => {
      try {
        const result = await apiRequest.post('/api/user/edit', {
          openid: row.openid,
          enable: row.enable,
          userName: row.userName,
          mobile: row.mobile
        });

        if (result.code === 0) {
          ElMessage.success(`${row.enable === 1 ? '启用' : '禁用'}用户成功`);
          fetchUsers();
        } else {
          // 恢复状态
          row.enable = row.enable === 1 ? 0 : 1;
          ElMessage.error(result.msg || '更新用户状态失败');
        }
      } catch (error) {
        // 恢复状态
        row.enable = row.enable === 1 ? 0 : 1;
        ElMessage.error('更新用户状态出错');
      }
    };

    // 提交用户（新增或编辑）
    const submitUser = async () => {
      if (!userForm.value) return;

      await userForm.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true;
          try {
            let result;

            if (isEditMode.value) {
              // 编辑用户
              let passwordToSend = '';
              const oriPwd = oriRow.password; //原md5密码
              if (form.password !== oriPwd) { //说明密码有改动
                passwordToSend = CryptoJS.MD5(form.password).toString();
              }

              result = await apiRequest.post('/api/user/edit', {
                openid: form.openid,
                enable: form.enable,
                userName: form.userName,
                mobile: form.mobile,
                password: passwordToSend
              });
            } else {
              // 新增用户
              result = await apiRequest.post('/api/user/add', {
                user_code: form.userCode,
                user_name: form.userName,
                mobile: form.mobile,
                password: form.password,
                enable: form.enable
              });
            }

            if (result.code === 0) {
              ElMessage.success(`${isEditMode.value ? '更新' : '创建'}用户成功`);
              dialogVisible.value = false;
              fetchUsers();
            } else {
              ElMessage.error(result.msg || `${isEditMode.value ? '更新' : '创建'}用户失败`);
            }
          } catch (error) {
            ElMessage.error(`${isEditMode.value ? '更新' : '创建'}用户出错`);
          } finally {
            submitLoading.value = false;
          }
        }
      });
    };

    // 关闭对话框时的清理工作
    const handleDialogClose = () => {
      if (userForm.value) {
        userForm.value.resetFields();
      }
    };

    // 分页相关方法
    const handleSizeChange = (val) => {
      pagination.size = val;
      fetchUsers();
    };

    const handleCurrentChange = (val) => {
      pagination.current = val;
      fetchUsers();
    };

    // MD5加密
    const md5Encrypt = (password) => {
      return CryptoJS.MD5(password).toString();
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      loading,
      submitLoading,
      dialogVisible,
      isEditMode,
      form,
      pagination,
      userRules,
      dialogTitle,
      userForm,
      fetchUsers,
      handleAdd,
      handleEdit,
      handleDelete,
      toggleUserStatus,
      submitUser,
      handleDialogClose,
      handleSizeChange,
      handleCurrentChange,
      md5Encrypt
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
