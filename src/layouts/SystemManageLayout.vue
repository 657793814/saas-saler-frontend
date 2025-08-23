<!-- src/layouts/SystemManageLayout.vue -->
<template>
  <div class="main-layout">

    <el-container class="main-container">
      <!-- 主内容区域 -->
      <el-main class="main-content">
        <router-view/>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import menuService from '@/utils/menuService'

export default {
  name: 'SystemManageLayout',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const username = ref(localStorage.getItem('username') || '管理员')
    const menus = ref([])
    const userRole = ref(localStorage.getItem('userRole') || 'admin')

    // 获取当前激活的菜单项
    const activeMenu = computed(() => {
      return route.path
    })

    // 根据用户角色过滤菜单
    const filteredMenus = computed(() => {
      if (!menus.value || menus.value.length === 0) {
        return []
      }
      try {
        const result = menuService.filterMenuTree(menus.value, userRole.value)
        return result || []
      } catch (error) {
        console.error('过滤菜单时出错:', error)
        return []
      }
    })

    // 获取用户菜单
    const fetchUserMenus = async () => {
      try {
        const userMenus = await menuService.getUserMenus()
        menus.value = Array.isArray(userMenus) ? userMenus : []
      } catch (error) {
        console.error('获取菜单失败:', error)
        menus.value = []
      }
    }

    // 处理菜单选择
    const handleMenuSelect = (indexPath) => {
      // 查找选中的菜单项
      const findMenu = (menuList) => {
        for (const menu of menuList) {
          if (menu.path === indexPath) {
            return menu;
          }
          if (menu.children) {
            const found = findMenu(menu.children);
            if (found) return found;
          }
        }
        return null;
      };

      const selectedMenu = findMenu(filteredMenus.value);

      // 如果选中的是父级菜单（有children但没有path），跳转到第一个子菜单
      if (selectedMenu && selectedMenu.children && selectedMenu.children.length > 0) {
        // 如果父级菜单有 path 且与当前选中路径相同，重定向到第一个子菜单
        if (selectedMenu.path === indexPath) {
          const firstChildPath = selectedMenu.children[0].path;
          if (firstChildPath) {
            router.push(firstChildPath).catch(err => {
              console.warn('路由跳转失败:', err);
            });
            return;
          }
        }
      }

      // 使用 router 进行导航
      if (indexPath) {
        router.push(indexPath).catch(err => {
          console.warn('路由跳转失败:', err);
        });
      }
    };

    // 处理用户下拉菜单命令
    const handleUserCommand = (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile').catch(() => {
            window.location.href = '/profile';
          });
          break;
        case 'logout':
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('userRole');
          router.push('/login').catch(() => {
            window.location.href = '/login';
          });
          break;
      }
    };

    onMounted(() => {
      fetchUserMenus();
    });

    return {
      username,
      activeMenu,
      filteredMenus,
      handleMenuSelect,
      handleUserCommand
    };
  }
};
</script>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.main-header {
  background-color: #409EFF;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
  height: 60px !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo h2 {
  margin: 0;
  color: white;
}

.user-info {
  cursor: pointer;
  color: white;
}

.main-container {
  height: calc(100vh - 60px);
  overflow: hidden;
}

.sidebar {
  background-color: #f5f5f5;
  border-right: 1px solid #e6e6e6;
}

.sidebar-menu {
  height: 100%;
  border: none;
}

.main-content {
  padding: 20px;
  background-color: #f0f2f5;
  overflow-y: auto;
  height: 100%;
}
</style>
