<!-- src/views/NotFound.vue -->
<template>
  <div class="not-found">
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">页面未找到</h2>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被删除。
        </p>
        <div class="error-actions">
          <el-button type="primary" @click="goHome">返回首页</el-button>
          <el-button @click="goBack">返回上一页</el-button>
        </div>
      </div>
      <div class="not-found-image">
        <svg viewBox="0 0 24 24" width="200" height="200">
          <path fill="#409EFF"
                d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import {useRouter} from 'vue-router'

export default {
  name: 'NotFound',
  setup() {
    const router = useRouter()

    const goHome = () => {
      router.push('/dashboard')
    }

    const goBack = () => {
      router.go(-1)
    }

    return {
      goHome,
      goBack
    }
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.not-found-container {
  display: flex;
  align-items: center;
  max-width: 800px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.not-found-content {
  flex: 1;
  padding-right: 40px;
}

.error-code {
  font-size: 72px;
  font-weight: 700;
  color: #409EFF;
  margin: 0 0 20px;
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px;
}

.error-description {
  font-size: 16px;
  color: #606266;
  line-height: 1.5;
  margin: 0 0 30px;
}

.error-actions {
  display: flex;
  gap: 16px;
}

.not-found-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-container {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
  }

  .not-found-content {
    padding-right: 0;
    margin-bottom: 30px;
  }

  .error-actions {
    justify-content: center;
  }

  .not-found-image {
    display: none;
  }
}
</style>