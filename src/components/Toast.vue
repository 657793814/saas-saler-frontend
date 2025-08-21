<!-- src/components/Toast.vue -->
<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="toast.type"
      >
        <i :class="getIconClass(toast.type)"></i>
        <span>{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'AppToast',
  data() {
    return {
      toasts: []
    }
  },
  methods: {
    show(message, type = 'info', duration = 3000) {
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

    getIconClass(type) {
      const icons = {
        info: 'icon-info',
        success: 'icon-success',
        warning: 'icon-warning',
        error: 'icon-error'
      };
      return icons[type] || 'icon-info';
    }
  }
}
</script>

<style scoped>
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
</style>
