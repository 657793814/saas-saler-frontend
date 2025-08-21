<!-- App.vue -->
<template>
  <div id="app">
    <!-- Toast 提示组件 -->
    <AppToast ref="toast"/>

    <!-- 消息框组件 -->
    <MessageBox
        :visible="messageBoxVisible"
        :title="messageBoxTitle"
        :message="messageBoxMessage"
        :type="messageBoxType"
        :show-cancel="messageBoxShowCancel"
        :confirm-text="messageBoxConfirmText"
        :cancel-text="messageBoxCancelText"
        @confirm="handleMessageBoxConfirm"
        @cancel="handleMessageBoxCancel"
    />

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
            <li v-for="menu in filteredMenus" :key="menu.id">
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
import AppToast from '@/components/Toast.vue'
import MessageBox from '@/components/MessageBox.vue'
import fullscreenMixin from '@/mixins/fullscreen';
import menuService from '@/utils/menuService';

export default {
  name: 'App',
  components: {
    AppToast,
    MessageBox
  },
  mixins: [fullscreenMixin],
  data() {
    return {
      sidebarCollapsed: false,
      showUserMenu: false,
      currentUser: {},
      username: '',
      userRole: 'user', // 默认角色
      menus: [], // 所有菜单
      // 消息框相关数据
      messageBoxVisible: false,
      messageBoxTitle: '',
      messageBoxMessage: '',
      messageBoxType: 'info',
      messageBoxShowCancel: false,
      messageBoxConfirmText: '确定',
      messageBoxCancelText: '取消',
      messageBoxCallback: null,
      messageBoxCancelCallback: null
    }
  },
  computed: {
    // 过滤后的菜单（根据用户角色）
    filteredMenus() {
      return menuService.filterMenuTree(this.menus, this.userRole);
    },

    currentPageTitle() {
      // 动态获取当前页面标题
      const currentMenu = this.menus.find(menu =>
          menu.path === this.$route.path ||
          (menu.children && menu.children.some(child => child.path === this.$route.path))
      );

      if (currentMenu) {
        if (currentMenu.path === this.$route.path) {
          return currentMenu.name;
        } else if (currentMenu.children) {
          const childMenu = currentMenu.children.find(child => child.path === this.$route.path);
          return childMenu ? childMenu.name : currentMenu.name;
        }
      }

      const routeMap = {
        '/dashboard': '仪表盘',
        '/users': '用户管理',
        '/settings': '系统设置'
      };
      return routeMap[this.$route.path] || '管理系统';
    }
  },
  mounted() {
    this.loadUserInfo();
    this.loadUserMenus();
    // 点击其他地方关闭用户菜单
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    // 显示 Toast 提示
    showToast(message, type = 'info', duration = 3000) {
      this.$refs.toast.show(message, type, duration);
    },

    // 显示消息框
    showMessageBox(options) {
      this.messageBoxTitle = options.title || '提示';
      this.messageBoxMessage = options.message || '';
      this.messageBoxType = options.type || 'info';
      this.messageBoxShowCancel = options.showCancel || false;
      this.messageBoxConfirmText = options.confirmText || '确定';
      this.messageBoxCancelText = options.cancelText || '取消';
      this.messageBoxCallback = options.onConfirm || null;
      this.messageBoxCancelCallback = options.onCancel || null;
      this.messageBoxVisible = true;
    },

    handleMessageBoxConfirm() {
      this.messageBoxVisible = false;
      if (this.messageBoxCallback) {
        this.messageBoxCallback();
      }
    },

    handleMessageBoxCancel() {
      this.messageBoxVisible = false;
      if (this.messageBoxCancelCallback) {
        this.messageBoxCancelCallback();
      }
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },

    handleClickOutside(event) {
      if (!event.target.closest('.user-profile') && !event.target.closest('.user-dropdown')) {
        this.showUserMenu = false;
      }
    },

    loadUserInfo() {
      const userInfoStr = localStorage.getItem('user_info');
      if (userInfoStr) {
        try {
          this.currentUser = JSON.parse(userInfoStr);
          this.username = this.currentUser.uname || this.currentUser.username || '用户';
          // 获取用户角色（根据实际返回数据结构调整）
          this.userRole = this.currentUser.role || this.currentUser.userRole || 'user';
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
        } else {
          // 如果获取失败，使用默认菜单
          console.warn('无法获取用户菜单，使用默认菜单');
          this.menus = this.getDefaultMenus();
        }
      } catch (error) {
        console.error('加载用户菜单失败:', error);
        // 使用默认菜单
        this.menus = this.getDefaultMenus();
      }
    },

    // 获取默认菜单
    getDefaultMenus() {
      return [
        {
          id: 'dashboard',
          name: '仪表盘',
          path: '/dashboard',
          icon: 'icon-dashboard',
          roles: ['admin', 'user', 'guest']
        },
        {
          id: 'users',
          name: '用户管理',
          path: '/users',
          icon: 'icon-users',
          roles: ['admin']
        },
        {
          id: 'settings',
          name: '系统设置',
          path: '/settings',
          icon: 'icon-settings',
          roles: ['admin']
        }
      ];
    },

    handleLogout() {
      // 使用全局消息框替代原生 confirm
      this.showMessageBox({
        title: '确认退出',
        message: '确定要退出登录吗？',
        type: 'warning',
        showCancel: true,
        confirmText: '退出登录',
        cancelText: '取消',
        onConfirm: () => {
          // 清除本地存储的用户信息
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_info');
          localStorage.removeItem('user_menus');

          // 清除菜单缓存
          menuService.clearCache();

          // 关闭用户菜单
          this.showUserMenu = false;

          // 跳转到登录页面
          this.$router.push('/');
        }
      });
    }
  }
}
</script>

<style scoped>
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
}

.app-layout {
  display: flex;
  height: 100vh;
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
}
</style>