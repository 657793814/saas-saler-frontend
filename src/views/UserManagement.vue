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
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
                <span class="role-tag" :class="getRoleClass(user.role)">
                  {{ user.role }}
                </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-edit" @click="openEditModal(user)">
                  <i class="icon-edit"></i>
                  编辑
                </button>
                <button class="btn-delete" @click="deleteUser(user.id)">
                  <i class="icon-delete"></i>
                  删除
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
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
            <label for="username">用户名</label>
            <input
                type="text"
                id="username"
                v-model="currentUser.username"
                required
                placeholder="请输入用户名"
            >
          </div>

          <div class="form-group">
            <label for="email">邮箱</label>
            <input
                type="email"
                id="email"
                v-model="currentUser.email"
                required
                placeholder="请输入邮箱"
            >
          </div>

          <div class="form-group">
            <label for="role">角色</label>
            <select id="role" v-model="currentUser.role" required>
              <option value="管理员">管理员</option>
              <option value="普通用户">普通用户</option>
              <option value="访客">访客</option>
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

<script>
export default {
  name: 'UserManagement',
  data() {
    return {
      users: [
        {id: 1, username: 'admin', email: 'admin@example.com', role: '管理员'},
        {id: 2, username: 'user1', email: 'user1@example.com', role: '普通用户'},
        {id: 3, username: 'user2', email: 'user2@example.com', role: '普通用户'}
      ],
      showModal: false,
      isEdit: false,
      currentUser: {
        id: null,
        username: '',
        email: '',
        role: '普通用户'
      }
    }
  },
  methods: {
    getRoleClass(role) {
      const roleClasses = {
        '管理员': 'admin',
        '普通用户': 'user',
        '访客': 'guest'
      };
      return roleClasses[role] || 'user';
    },

    openAddModal() {
      this.isEdit = false;
      this.currentUser = {
        id: null,
        username: '',
        email: '',
        role: '普通用户'
      };
      this.showModal = true;
    },

    openEditModal(user) {
      this.isEdit = true;
      this.currentUser = {...user};
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    saveUser() {
      if (this.isEdit) {
        // 更新用户
        const index = this.users.findIndex(u => u.id === this.currentUser.id);
        if (index !== -1) {
          this.users.splice(index, 1, {...this.currentUser});
        }
      } else {
        // 添加新用户
        const newId = Math.max(...this.users.map(u => u.id)) + 1;
        this.users.push({
          id: newId,
          ...this.currentUser
        });
      }
      this.closeModal();
    },

    deleteUser(id) {
      if (confirm('确定要删除这个用户吗？')) {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.users.splice(index, 1);
        }
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
}

.table-container {
  overflow-x: auto;
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

.role-tag {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.role-tag.admin {
  background-color: #ffebee;
  color: #c62828;
}

.role-tag.user {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.role-tag.guest {
  background-color: #fff8e1;
  color: #f9a825;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-edit, .btn-delete {
  display: inline-flex;
  align-items: center;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-edit {
  background-color: #fff3e0;
  color: #ef6c00;
}

.btn-edit:hover {
  background-color: #ffe0b2;
}

.btn-delete {
  background-color: #ffebee;
  color: #c62828;
}

.btn-delete:hover {
  background-color: #ffcdd2;
}

.btn-edit i, .btn-delete i {
  margin-right: 5px;
  font-size: 0.9rem;
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
