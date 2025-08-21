<!-- Login.vue -->
<template>
  <div class="login-container">
    <!-- 背景轮播 -->
    <div class="background-carousel">
      <div
          class="carousel-slide"
          v-for="(image, index) in backgroundImages"
          :key="index"
          :class="{ active: index === currentSlide }"
          :style="{ backgroundImage: `url(${image})` }"
      ></div>

      <!-- 指示器 -->
      <div class="carousel-indicators">
        <span
            v-for="(image, index) in backgroundImages"
            :key="index"
            :class="{ active: index === currentSlide }"
            @click="goToSlide(index)"
        ></span>
      </div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-header">
        <h1>欢迎登录</h1>
        <p>请输入您的账户信息</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="tenant_code">租户编码</label>
          <input
              type="text"
              id="tenant_code"
              v-model="loginForm.tenant_code"
              placeholder="请输入租户编码"
              required
          />
        </div>

        <div class="form-group">
          <label for="username">用户名</label>
          <input
              type="text"
              id="username"
              v-model="loginForm.username"
              placeholder="请输入用户名"
              required
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
              type="password"
              id="password"
              v-model="loginForm.password"
              placeholder="请输入密码"
              required
          />
        </div>

        <button
            type="submit"
            class="login-btn"
            :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<!-- Login.vue -->
<script>
import CryptoJS from 'crypto-js'
import notify from '@/utils/notify'

export default {
  name: 'LoginView',
  data() {
    return {
      loginForm: {
        login_type: 1,
        username: '',
        password: '',
        tenant_code: 'liuzd'
      },
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.errorMessage = '';

      const encryptedPassword = this.encryptPassword(this.loginForm.password);

      const requestData = {
        login_type: this.loginForm.login_type,
        username: this.loginForm.username,
        password: encryptedPassword,
        tenant_code: this.loginForm.tenant_code
      };

      try {
        const queryParams = new URLSearchParams({
          tenant_code: this.loginForm.tenant_code
        }).toString();

        const response = await fetch(`/api/login?${queryParams}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (response.ok && result.code === 0) {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('refresh_token', result.data.refresh_token);
          localStorage.setItem('user_info', JSON.stringify(result.data.user_info));
          localStorage.setItem('rand_str', result.data.rand_str);
          localStorage.setItem('tenant_code', this.loginForm.tenant_code);

          this.$router.push('/dashboard');
        } else {
          this.errorMessage = result.msg || '登录失败';
          notify.error(result.msg || '登录失败');
        }
      } catch (error) {
        this.errorMessage = '网络错误，请稍后重试';
        notify.error('网络错误，请稍后重试');
        console.error('登录请求失败:', error);
      } finally {
        this.loading = false;
      }
    },

    encryptPassword(password) {
      return CryptoJS.MD5(password).toString();
    }
  }
}
</script>

<style scoped>/* 全局样式：确保全屏且无滚动 */
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

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

/* 背景轮播 */
.background-carousel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

/* 更亮的背景遮罩层 */
.background-carousel::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4); /* 减少遮罩层的暗度 */
}

/* 轮播指示器 */
.carousel-indicators {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.carousel-indicators span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7); /* 更亮的指示器 */
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.carousel-indicators span.active {
  background: white;
  transform: scale(1.2);
}

.carousel-indicators span:hover {
  background: rgba(255, 255, 255, 0.9);
}

/* 登录卡片 */
.login-card {
  width: 100%;
  max-width: 450px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9); /* 更亮的背景 */
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  z-index: 10;
  margin: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.8);
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
  background: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.login-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2980b9, #2573a7);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.login-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  padding: 15px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #ffcdd2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    margin: 15px;
    padding: 30px 20px;
    max-width: none;
  }

  .carousel-indicators {
    bottom: 20px;
  }

  .carousel-indicators span {
    width: 10px;
    height: 10px;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }
}
</style>