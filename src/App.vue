<!-- App.vue -->
<template>
  <div id="app">
    <!-- Toast 提示组件 -->
    <div class="toast-container">
      <transition-group name="toast" tag="div">
        <div
            v-for="toast in toasts"
            :key="toast.id"
            class="toast"
            :class="toast.type"
        >
          <i :class="getToastIconClass(toast.type)"></i>
          <span>{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>

    <!-- 确认弹窗组件 -->
    <div class="modal-overlay" v-if="confirmVisible">
      <div class="beautiful-modal confirm-modal" :class="confirmType">
        <div class="modal-header">
          <div class="modal-icon" :class="confirmType">
            <i :class="getModalIconClass(confirmType)"></i>
          </div>
          <h3>{{ confirmTitle }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ confirmMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="handleConfirmCancel">{{ confirmCancelText }}</button>
          <button class="btn-confirm" :class="confirmType" @click="handleConfirmConfirm">
            {{ confirmConfirmText }}
          </button>
        </div>
      </div>
    </div>

    <!-- 登录页面单独处理 -->
    <router-view v-if="$route.path === '/' || $route.path === '/login'"></router-view>

    <!-- 已登录用户的布局 -->
    <div class="app-layout" v-else>
      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <h2 v-if="!sidebarCollapsed">管理系统</h2>
          <div class="toggle-btn" @click="toggleSidebar">
            <span v-if="sidebarCollapsed">☰</span>
            <span v-else>≡</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <ul>
            <li v-for="menu in menus" :key="menu.id">
              <router-link
                  :to="menu.path"
                  active-class="active"
                  :title="menu.name"
              >
                <i :class="menu.icon"></i>
                <span v-if="!sidebarCollapsed">{{ menu.name }}</span>
              </router-link>

              <!-- 子菜单 -->
              <ul v-if="menu.children && menu.children.length > 0 && !sidebarCollapsed" class="submenu">
                <li v-for="child in menu.children" :key="child.id">
                  <router-link
                      :to="child.path"
                      active-class="active"
                      :title="child.name"
                  >
                    <i :class="child.icon"></i>
                    <span>{{ child.name }}</span>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- 主内容区域 -->
      <div class="main-wrapper">
        <!-- 顶部导航栏 -->
        <header class="topbar">
          <div class="topbar-left">
            <h1>{{ currentPageTitle }}</h1>
          </div>
          <div class="topbar-right">
            <!-- 用户名展示 -->
            <div class="user-info">
              <span class="username">登录用户：{{ username }}</span>
              <div class="avatar">{{ username ? username.charAt(0).toUpperCase() : 'U' }}</div>
            </div>

            <!-- 退出登录按钮 -->
            <button class="logout-btn" @click="handleLogout">
              <span>退出</span>
            </button>
          </div>
        </header>

        <!-- 页面内容 -->
        <main class="main-content">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import menuService from '@/utils/menuService';
import {menuIconCSS} from '@/config/menus'

export default {
  name: 'App',
  data() {
    return {
      sidebarCollapsed: false,
      currentUser: {},
      username: '',
      userRole: 'user',
      menus: [],
      // Toast 相关数据
      toasts: [],
      // 确认弹窗相关数据
      confirmVisible: false,
      confirmTitle: '',
      confirmMessage: '',
      confirmType: 'info',
      confirmConfirmText: '确定',
      confirmCancelText: '取消',
      confirmCallback: null,
      confirmCancelCallback: null
    }
  },
  computed: {
    currentPageTitle() {
      const routeMap = {
        '/dashboard': '仪表盘',
        '/users': '用户管理',
        '/settings': '系统设置'
      };
      return routeMap[this.$route.path] || '管理系统';
    }
  },
  mounted() {

    // 动态注入图标样式
    if (!document.getElementById('menu-icons-style')) {
      const style = document.createElement('style')
      style.id = 'menu-icons-style'
      style.textContent = menuIconCSS
      document.head.appendChild(style)
    }

    this.loadUserInfo();
    this.loadUserMenus();

  },
  methods: {
    // Toast 相关方法
    showToast(message, type = 'info', duration = 3000) {
      const id = Date.now() + Math.random();
      this.toasts.push({
        id,
        message,
        type
      });

      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    },

    removeToast(id) {
      const index = this.toasts.findIndex(toast => toast.id === id);
      if (index !== -1) {
        this.toasts.splice(index, 1);
      }
    },

    getToastIconClass(type) {
      const icons = {
        info: 'icon-info',
        success: 'icon-success',
        warning: 'icon-warning',
        error: 'icon-error'
      };
      return icons[type] || 'icon-info';
    },

    // 确认弹窗相关方法
    showConfirm(options) {
      this.confirmTitle = options.title || '确认';
      this.confirmMessage = options.message || '';
      this.confirmType = options.type || 'info';
      this.confirmConfirmText = options.confirmText || '确定';
      this.confirmCancelText = options.cancelText || '取消';
      this.confirmCallback = options.onConfirm || null;
      this.confirmCancelCallback = options.onCancel || null;
      this.confirmVisible = true;
    },

    handleConfirmConfirm() {
      this.confirmVisible = false;
      if (this.confirmCallback) {
        this.confirmCallback();
      }
    },

    handleConfirmCancel() {
      this.confirmVisible = false;
      if (this.confirmCancelCallback) {
        this.confirmCancelCallback();
      }
    },

    getModalIconClass(type) {
      const icons = {
        info: 'icon-info',
        success: 'icon-success',
        warning: 'icon-warning',
        error: 'icon-error'
      };
      return icons[type] || 'icon-info';
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    loadUserInfo() {
      const userInfoStr = localStorage.getItem('user_info');
      if (userInfoStr) {
        try {
          this.currentUser = JSON.parse(userInfoStr);
          this.username = this.currentUser.uname || this.currentUser.username || '用户';
        } catch (e) {
          console.error('解析用户信息失败', e);
        }
      }
    },

    async loadUserMenus() {
      try {
        // 首先尝试从本地存储获取缓存的菜单
        const cachedMenus = localStorage.getItem('user_menus');
        if (cachedMenus) {
          try {
            this.menus = JSON.parse(cachedMenus);
            return;
          } catch (e) {
            console.error('解析缓存菜单失败', e);
          }
        }

        // 如果没有缓存，从服务器获取
        const menus = await menuService.getUserMenus();
        if (menus && menus.length > 0) {
          this.menus = menus;
        }
      } catch (error) {
        console.error('加载用户菜单失败:', error);
      }
    },

    handleLogout() {
      // 使用全局统一的确认弹窗
      this.showConfirm({
        title: '确认退出',
        message: '确定要退出登录吗？',
        type: 'warning',
        confirmText: '退出登录',
        cancelText: '取消',
        onConfirm: () => {
          // 清除本地存储的用户信息
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_info');
          localStorage.removeItem('user_menus');
          localStorage.removeItem('rand_str');
          localStorage.removeItem('tenant_code');

          // 清除菜单缓存
          menuService.clearCache();

          // 跳转到登录页面
          this.$router.push('/');
        }
      });
    }
  }
}
</script>

<style>
/* 全局样式：确保全屏且无滚动 */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  height: 100vh;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
}
</style>

<style scoped>
/* Toast 样式 */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
}

.toast {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease-out;
  min-width: 250px;
  color: white;
  font-weight: 500;
}

.toast.info {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.toast.success {
  background: linear-gradient(135deg, #27ae60, #219653);
}

.toast.warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.toast.error {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.toast i {
  margin-right: 10px;
  font-size: 1.2rem;
}

.toast.toast-enter-active, .toast.toast-leave-active {
  transition: all 0.3s;
}

.toast.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 图标样式 */
.icon-info::before {
  content: "ℹ️";
}

.icon-success::before {
  content: "✅";
}

.icon-warning::before {
  content: "⚠️";
}

.icon-error::before {
  content: "❌";
}

/* 确认弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.beautiful-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 20px 20px 10px 20px;
  border-bottom: 1px solid #eee;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 1.2rem;
}

.modal-icon.info {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.modal-icon.success {
  background: linear-gradient(135deg, #27ae60, #219653);
  color: white;
}

.modal-icon.warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.modal-icon.error {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.modal-body {
  padding: 20px 25px;
}

.modal-body p {
  margin: 0;
  color: #555;
  line-height: 1.6;
  font-size: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 15px 25px 25px 25px;
}

.btn-confirm, .btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
  min-width: 80px;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-confirm {
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-confirm.info {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.btn-confirm.success {
  background: linear-gradient(135deg, #27ae60, #219653);
}

.btn-confirm.warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.btn-confirm.error {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #2c3e50, #1a2530);
  color: white;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
}

.toggle-btn {
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin: 0;
}

.sidebar-nav > ul > li {
  margin: 5px 0;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
  white-space: nowrap;
}

.sidebar-nav a:hover,
.sidebar-nav a.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar-nav i {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  margin-right: 15px;
}

/* 子菜单样式 */
.submenu {
  padding-left: 0;
  background: rgba(0, 0, 0, 0.2);
}

.submenu li {
  margin: 0;
}

.submenu a {
  padding: 12px 20px 12px 54px;
  font-size: 0.9rem;
}

/* 主内容区域 */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航栏 */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  z-index: 99;
  flex-shrink: 0;
}

.topbar-left h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 8px 15px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.username {
  margin-right: 10px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(52, 152, 219, 0.3);
}

/* 美化后的退出按钮 */
.logout-btn {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(231, 76, 60, 0.3);
}

.logout-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a5281b);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(231, 76, 60, 0.4);
}

.logout-btn:active {
  transform: translateY(0);
}

.logout-btn::before {
  content: "🚪";
  margin-right: 8px;
  font-size: 1.1rem;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
}

/* 图标样式 */
.icon-dashboard::before {
  content: "📊";
}

.icon-users::before {
  content: "👥";
}

.icon-settings::before {
  content: "⚙️";
}

.icon-profile::before {
  content: "👤";
}

.icon-home::before {
  content: "🏠";
}

.icon-report::before {
  content: "📈";
}

.icon-document::before {
  content: "📄";
}

.icon-message::before {
  content: "💬";
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100%;
    transform: translateX(0);
    transition: transform 0.3s ease;
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }

  .main-wrapper {
    margin-left: 0;
  }

  .topbar {
    padding: 0 15px;
  }

  .topbar-right {
    gap: 10px;
  }

  .user-info {
    padding: 6px 12px;
  }

  .username {
    display: none;
  }

  .avatar {
    width: 30px;
    height: 30px;
  }

  .logout-btn span {
    display: none;
  }

  .logout-btn::before {
    margin-right: 0;
  }

  /* 移动端 Toast 和弹窗适配 */
  .toast-container {
    right: 10px;
    left: 10px;
  }

  .beautiful-modal {
    margin: 20px;
    width: calc(100% - 40px);
  }

  .modal-footer {
    flex-direction: column;
    padding: 15px 20px 20px 20px;
  }

  .btn-confirm, .btn-cancel {
    width: 100%;
  }
}
</style>
