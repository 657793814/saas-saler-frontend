<template>
  <div class="dashboard">
    <h1>欢迎来到管理系统</h1>
    <div class="stats">
      <div class="stat-card">
        <h3>用户总数</h3>
        <p>1,234</p>
      </div>
      <div class="stat-card">
        <h3>在线用户</h3>
        <p>56</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardView'
}
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.dashboard h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-card {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  margin-top: 0;
  color: #7f8c8d;
}

.stat-card p {
  font-size: 2em;
  font-weight: bold;
  color: #3498db;
  margin: 10px 0 0;
}
</style>