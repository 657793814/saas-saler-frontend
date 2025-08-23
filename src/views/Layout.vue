<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <nav class="top-navbar">
      <div class="nav-brand">管理系统</div>
      <ul class="nav-menu">
        <li>
          <router-link to="/home/dashboard">仪表盘</router-link>
        </li>
        <li>
          <router-link to="/home/users">用户管理</router-link>
        </li>
        <li>
          <router-link to="/home/settings">设置</router-link>
        </li>
      </ul>
    </nav>

    <!-- 侧边栏 -->
    <aside class="sidebar">
      <ul>
        <li>
          <router-link to="/home/dashboard">仪表盘</router-link>
        </li>
        <li>
          <router-link to="/home/users">用户管理</router-link>
        </li>
        <li>
          <router-link to="/home/settings">系统设置</router-link>
        </li>
        <li>
          <router-link to="/home/profile">个人资料</router-link>
        </li>
      </ul>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'SystemManageLayout'
}
</script>

<style scoped>

.layout-container {
  display: flex;
  min-height: 100vh;
}

.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 999;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin-left: auto;
}

.nav-menu li {
  margin-left: 20px;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  padding: 0px 0px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-menu a:hover,
.nav-menu a.router-link-active {
  background-color: #3498db;
}

.sidebar {
  width: 250px;
  background-color: #34495e;
  color: white;
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  padding-top: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 10px;
}

.sidebar a {
  display: block;
  color: white;
  text-decoration: none;
  padding: 12px 20px;
  transition: background-color 0.3s;
}

.sidebar a:hover,
.sidebar a.router-link-active {
  background-color: #3498db;
}

.main-content {
  flex: 1;
  margin-top: 60px;
  margin-left: 250px;
  padding: 20px;
}
</style>