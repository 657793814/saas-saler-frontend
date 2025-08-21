<!-- UserManagement.vue -->
<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <button class="btn-primary" @click="openAddModal">
        <i class="icon-add"></i>
        添加用户
      </button>
    </div>

    <div class="card">
      <div class="table-container">
        <table class="data-table">
          <thead>
          <tr>
            <th>用户编码</th>
            <th>用户名</th>
            <th>手机号</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="user in users" :key="user.openid">
            <td>{{ user.userCode }}</td>
            <td>{{ user.userName }}</td>
            <td>{{ user.mobile }}</td>
            <td>
              <span class="status-tag" :class="{ active: user.enable === 1 }">
                {{ user.enable === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-edit" @click="openEditModal(user)">
                  <i class="icon-edit"></i>
                  编辑
                </button>
                <!-- 启用/禁用开关 -->
                <label class="switch">
                  <input
                      type="checkbox"
                      :checked="user.enable === 1"
                      @change="toggleUserStatus(user)"
                  >
                  <span class="slider"></span>
                </label>
                <span class="status-text">{{ user.enable === 1 ? '启用' : '禁用' }}</span>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="pagination.total > 0">
        <div class="pagination-info">
          共 {{ pagination.total }} 条记录，第 {{ pagination.current }} / {{ pagination.pages }} 页
        </div>
        <div class="pagination-controls">
          <!-- 跳转到首页 -->
          <button
              class="btn-pagination"
              :disabled="pagination.current === 1"
              @click="loadUsers(1)"
          >
            首页
          </button>

          <!-- 上一页 -->
          <button
              class="btn-pagination"
              :disabled="pagination.current === 1"
              @click="loadUsers(pagination.current - 1)"
          >
            上一页
          </button>

          <!-- 页码输入框 -->
          <div class="page-jump">
            <input
                type="number"
                v-model="jumpPage"
                :min="1"
                :max="pagination.pages"
                class="page-input"
                @keyup.enter="jumpToPage"
            />
            <button class="btn-jump" @click="jumpToPage">跳转</button>
          </div>

          <!-- 下一页 -->
          <button
              class="btn-pagination"
              :disabled="pagination.current === pagination.pages"
              @click="loadUsers(pagination.current + 1)"
          >
            下一页
          </button>

          <!-- 跳转到末页 -->
          <button
              class="btn-pagination"
              :disabled="pagination.current === pagination.pages"
              @click="loadUsers(pagination.pages)"
          >
            末页
          </button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑用户模态框 -->
    <div class="modal-overlay" v-if="showModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEdit ? '编辑用户' : '添加用户' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="saveUser" class="modal-body">
          <div class="form-group">
            <label for="userCode">用户编码</label>
            <input
                type="text"
                id="userCode"
                v-model="currentUser.userCode"
                required
                placeholder="请输入用户编码"
                :disabled="isEdit"
            >
          </div>

          <div class="form-group">
            <label for="userName">用户名</label>
            <input
                type="text"
                id="userName"
                v-model="currentUser.userName"
                required
                placeholder="请输入用户名"
            >
          </div>

          <div class="form-group">
            <label for="mobile">手机号</label>
            <input
                type="tel"
                id="mobile"
                v-model="currentUser.mobile"
                required
                placeholder="请输入手机号"
            >
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
                type="password"
                id="password"
                v-model="currentUser.password"
                :required="!isEdit"
                placeholder="请输入密码"
            >
          </div>

          <div class="form-group">
            <label for="enable">状态</label>
            <select id="enable" v-model="currentUser.enable" required>
              <option :value="1">启用</option>
              <option :value="0">禁用</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeModal">取消</button>
            <button type="submit" class="btn-primary">
              {{ isEdit ? '更新' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<!-- UserManagement.vue -->
<script>
import apiRequest from '@/utils/request';
import notify from '@/utils/notify';
import CryptoJS from "crypto-js";

export default {
  name: 'UserManagement',
  data() {
    return {
      users: [],
      showModal: false,
      isEdit: false,
      currentUser: {
        openid: '',
        userCode: '',
        userName: '',
        mobile: '',
        password: '',
        salt: '',
        enable: 1
      },
      originalUser: null,
      pagination: {
        total: 0,
        current: 1,
        size: 10,
        pages: 0
      },
      jumpPage: ''
    }
  },

  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page')) || 1;
    this.loadUsers(page);
  },

  methods: {
    async loadUsers(page = 1) {
      try {
        this.updateUrl(page);

        const result = await apiRequest.post('/api/user/page', {
          current: page,
          size: 10
        });

        if (result.code === 0) {
          this.users = result.data.records;
          this.pagination.total = result.data.total;
          this.pagination.current = result.data.current;
          this.pagination.size = result.data.size;
          this.pagination.pages = Math.ceil(result.data.total / result.data.size);
          this.jumpPage = page;
        } else {
          notify.error('获取用户列表失败: ' + result.msg);
        }
      } catch (error) {
        console.error('获取用户列表错误:', error);
        notify.error('网络错误，请稍后重试');
      }
    },

    updateUrl(page) {
      const url = new URL(window.location);
      url.searchParams.set('page', page);
      window.history.replaceState({}, '', url);
    },

    jumpToPage() {
      const page = parseInt(this.jumpPage);
      if (page && page >= 1 && page <= this.pagination.pages) {
        this.loadUsers(page);
      } else {
        notify.warning(`请输入有效的页码（1-${this.pagination.pages}）`);
        this.jumpPage = this.pagination.current;
      }
    },

    // 切换用户状态
    async toggleUserStatus(user) {
      const action = user.enable === 1 ? '禁用' : '启用';
      const confirmed = await notify.confirm(
          `确定要${action}用户 ${user.userName} 吗？`,
          {
            title: '确认操作',
            type: 'warning'
          }
      );

      if (confirmed) {
        try {
          const result = await apiRequest.post('/api/user/edit', {
            openid: user.openid,
            enable: user.enable !== 1,
            userName: user.userName,
            mobile: user.mobile
          });

          if (result.code === 0) {
            const index = this.users.findIndex(u => u.openid === user.openid);
            if (index !== -1) {
              this.users[index].enable = user.enable !== 1 ? 1 : 0;
            }
            notify.success(`${action}用户成功`);
          } else {
            notify.error('更新用户状态失败: ' + result.msg);
            const index = this.users.findIndex(u => u.openid === user.openid);
            if (index !== -1) {
              this.users[index].enable = user.enable;
            }
          }
        } catch (error) {
          console.error('更新用户状态错误:', error);
          notify.error('网络错误，请稍后重试');
          const index = this.users.findIndex(u => u.openid === user.openid);
          if (index !== -1) {
            this.users[index].enable = user.enable;
          }
        }
      } else {
        const index = this.users.findIndex(u => u.openid === user.openid);
        if (index !== -1) {
          this.users[index].enable = user.enable;
        }
      }
    },

    md5Encrypt(password) {
      return CryptoJS.MD5(password).toString();
    },

    openAddModal() {
      this.isEdit = false;
      this.currentUser = {
        openid: '',
        userCode: '',
        userName: '',
        mobile: '',
        password: '',
        salt: '',
        enable: 1
      };
      this.originalUser = null;
      this.showModal = true;
    },

    openEditModal(user) {
      this.isEdit = true;
      this.originalUser = {...user};
      this.currentUser = {...user};
      this.currentUser.password = '';
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async saveUser() {
      try {
        let result;

        if (this.isEdit) {
          let passwordToSend = '';
          if (this.currentUser.password && this.currentUser.password !== '') {
            const originalPasswordMd5 = this.originalUser.password;
            const newPasswordMd5 = this.md5Encrypt(this.currentUser.password);

            if (originalPasswordMd5 !== newPasswordMd5) {
              passwordToSend = this.currentUser.password;
            }
          }

          result = await apiRequest.post('/api/user/edit', {
            openid: this.currentUser.openid,
            enable: this.currentUser.enable === 1,
            userName: this.currentUser.userName,
            mobile: this.currentUser.mobile,
            password: passwordToSend
          });
        } else {
          result = await apiRequest.post('/api/user/add', {
            user_code: this.currentUser.userCode,
            user_name: this.currentUser.userName,
            mobile: this.currentUser.mobile,
            password: this.currentUser.password,
            enable: this.currentUser.enable === 1
          });
        }

        if (result.code === 0) {
          this.closeModal();
          this.loadUsers(this.pagination.current);
          notify.success(this.isEdit ? '更新用户成功' : '添加用户成功');
        } else {
          notify.error('保存用户失败: ' + result.msg);
        }
      } catch (error) {
        console.error('保存用户错误:', error);
        notify.error('网络错误，请稍后重试');
      }
    }
  }
}
</script>

<style scoped>
.user-management {
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(52, 152, 219, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2980b9, #2573a7);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.4);
}

.btn-primary i {
  margin-right: 8px;
}

.card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100% - 70px);
}

.table-container {
  overflow-x: auto;
  flex: 1;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 15px 20px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.status-tag {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-tag.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-tag:not(.active) {
  background-color: #ffebee;
  color: #c62828;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-edit {
  display: inline-flex;
  align-items: center;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  background-color: #fff3e0;
  color: #ef6c00;
}

.btn-edit:hover {
  background-color: #ffe0b2;
}

.btn-edit i {
  margin-right: 5px;
  font-size: 0.9rem;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #27ae60;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.status-text {
  font-size: 0.85rem;
  color: #666;
  min-width: 30px;
}

.btn-pagination, .btn-jump {
  display: inline-flex;
  align-items: center;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  background-color: #f8f9fa;
  color: #495057;
}

.btn-pagination:hover:not(:disabled), .btn-jump:hover {
  background-color: #e9ecef;
}

.btn-pagination:disabled {
  background-color: #eee;
  color: #999;
  cursor: not-allowed;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background-color: #f8f9fa;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 5px;
}

.page-input {
  width: 60px;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.page-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #95a5a6;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #2c3e50;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.btn-cancel {
  padding: 10px 20px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-cancel:hover {
  background-color: #7f8c8d;
}

/* 图标样式 */
.icon-add::before {
  content: "➕";
}

.icon-edit::before {
  content: "✏️";
}

.icon-delete::before {
  content: "🗑️";
}
</style>