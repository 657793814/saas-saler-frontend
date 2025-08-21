<!-- src/components/MessageBox.vue -->
<template>
  <div class="message-box-overlay" v-if="visible">
    <div class="message-box" :class="type">
      <div class="message-header">
        <i :class="iconClass"></i>
        <h3>{{ title }}</h3>
      </div>
      <div class="message-content">
        <p>{{ message }}</p>
      </div>
      <div class="message-footer">
        <button
            v-if="showCancel"
            class="btn-cancel"
            @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button
            class="btn-confirm"
            :class="type"
            @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageBox',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '提示'
    },
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'info', // info, success, warning, error
      validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
    },
    showCancel: {
      type: Boolean,
      default: false
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    }
  },
  computed: {
    iconClass() {
      const icons = {
        info: 'icon-info',
        success: 'icon-success',
        warning: 'icon-warning',
        error: 'icon-error'
      };
      return icons[this.type] || 'icon-info';
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    },
    handleCancel() {
      this.$emit('cancel');
    }
  }
}
</script>

<style scoped>
.message-box-overlay {
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

.message-box {
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

.message-header {
  display: flex;
  align-items: center;
  padding: 20px 20px 10px 20px;
  border-bottom: 1px solid #eee;
}

.message-header i {
  font-size: 1.5rem;
  margin-right: 12px;
}

.message-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.message-content {
  padding: 20px;
}

.message-content p {
  margin: 0;
  color: #555;
  line-height: 1.6;
}

.message-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.btn-confirm, .btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
}

.btn-confirm.info {
  background: #3498db;
  color: white;
}

.btn-confirm.success {
  background: #27ae60;
  color: white;
}

.btn-confirm.warning {
  background: #f39c12;
  color: white;
}

.btn-confirm.error {
  background: #e74c3c;
  color: white;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
