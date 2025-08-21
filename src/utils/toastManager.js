// src/utils/toastManager.js
class ToastManager {
    constructor() {
        this.toasts = [];
        this.toastContainer = null;
        this.init();
    }

    init() {
        // 创建 Toast 容器
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'global-toast-container';
        document.body.appendChild(this.toastContainer);
    }

    // 显示 Toast
    show(message, type = 'info', duration = 3000) {
        const toastId = Date.now() + Math.random();
        const toast = this.createToast({
            id: toastId,
            message,
            type
        });

        this.toasts.push({id: toastId, element: toast});
        this.toastContainer.appendChild(toast);

        // 自动移除
        setTimeout(() => {
            this.removeToast(toastId);
        }, duration);
    }

    // 创建 Toast
    createToast(options) {
        const {id, message, type} = options;

        const toast = document.createElement('div');
        toast.className = `beautiful-toast ${type}`;
        toast.innerHTML = `
      <div class="toast-icon ${type}">
        <i class="toast-icon-${type}"></i>
      </div>
      <div class="toast-message">${message}</div>
      <div class="toast-close">&times;</div>
    `;

        // 绑定关闭事件
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(id);
        });

        return toast;
    }

    // 移除 Toast
    removeToast(id) {
        const index = this.toasts.findIndex(toast => toast.id === id);
        if (index !== -1) {
            const toast = this.toasts[index];
            toast.element.style.animation = 'toastSlideOut 0.3s ease-out forwards';

            setTimeout(() => {
                if (toast.element.parentNode) {
                    toast.element.parentNode.removeChild(toast.element);
                }
                this.toasts.splice(index, 1);
            }, 300);
        }
    }
}

// 添加 Toast 动画样式
const toastStyles = `
  @keyframes toastSlideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes toastSlideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .global-toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .beautiful-toast {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 250px;
    color: white;
    font-weight: 500;
    animation: toastSlideIn 0.3s ease-out;
  }
  
  .toast-icon {
    margin-right: 10px;
    font-size: 1.2rem;
  }
  
  .toast-message {
    flex: 1;
    font-size: 0.95rem;
  }
  
  .toast-close {
    margin-left: 15px;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: bold;
    opacity: 0.8;
    transition: opacity 0.2s;
  }
  
  .toast-close:hover {
    opacity: 1;
  }
  
  .beautiful-toast.info {
    background: linear-gradient(135deg, #3498db, #2980b9);
  }
  
  .beautiful-toast.success {
    background: linear-gradient(135deg, #27ae60, #219653);
  }
  
  .beautiful-toast.warning {
    background: linear-gradient(135deg, #f39c12, #e67e22);
  }
  
  .beautiful-toast.error {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
  }
  
  .toast-icon-info::before { content: "ℹ️"; }
  .toast-icon-success::before { content: "✅"; }
  .toast-icon-warning::before { content: "⚠️"; }
  .toast-icon-error::before { content: "❌"; }
`;

// 注入样式
const styleSheet = document.createElement('style');
styleSheet.innerText = toastStyles;
document.head.appendChild(styleSheet);

// 创建单例
const toastManager = new ToastManager();
export default toastManager;
