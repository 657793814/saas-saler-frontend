// src/utils/modalManager.js
class ModalManager {
    constructor() {
        this.modals = [];
        this.modalContainer = null;
        this.init();
    }

    init() {
        // 创建弹窗容器
        this.modalContainer = document.createElement('div');
        this.modalContainer.className = 'global-modal-container';
        document.body.appendChild(this.modalContainer);
    }

    // 显示确认弹窗
    confirm(options) {
        return new Promise((resolve) => {
            const {
                title = '确认',
                message = '',
                type = 'warning',
                confirmText = '确定',
                cancelText = '取消'
            } = options;

            const modalId = Date.now() + Math.random();
            const modal = this.createConfirmModal({
                id: modalId,
                title,
                message,
                type,
                confirmText,
                cancelText,
                onConfirm: () => {
                    this.removeModal(modalId);
                    resolve(true);
                },
                onCancel: () => {
                    this.removeModal(modalId);
                    resolve(false);
                }
            });

            this.modals.push({id: modalId, element: modal});
            this.modalContainer.appendChild(modal);
        });
    }

    // 显示提示弹窗
    alert(options) {
        return new Promise((resolve) => {
            const {
                title = '提示',
                message = '',
                type = 'info',
                confirmText = '确定'
            } = options;

            const modalId = Date.now() + Math.random();
            const modal = this.createAlertModal({
                id: modalId,
                title,
                message,
                type,
                confirmText,
                onConfirm: () => {
                    this.removeModal(modalId);
                    resolve();
                }
            });

            this.modals.push({id: modalId, element: modal});
            this.modalContainer.appendChild(modal);
        });
    }

    // 创建确认弹窗
    createConfirmModal(options) {
        const {
            title,
            message,
            type,
            confirmText,
            cancelText,
            onConfirm,
            onCancel
        } = options;

        const modal = document.createElement('div');
        modal.className = 'beautiful-modal-overlay';
        modal.innerHTML = `
      <div class="beautiful-modal confirm-modal ${type}">
        <div class="modal-header">
          <div class="modal-icon ${type}">
            <i class="modal-icon-${type}"></i>
          </div>
          <h3>${title}</h3>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel">${cancelText}</button>
          <button class="btn-confirm ${type}">${confirmText}</button>
        </div>
      </div>
    `;

        // 绑定事件
        const confirmBtn = modal.querySelector('.btn-confirm');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const overlay = modal;

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                onCancel();
            }
        });

        return modal;
    }

    // 创建提示弹窗
    createAlertModal(options) {
        const {
            title,
            message,
            type,
            confirmText,
            onConfirm
        } = options;

        const modal = document.createElement('div');
        modal.className = 'beautiful-modal-overlay';
        modal.innerHTML = `
      <div class="beautiful-modal alert-modal ${type}">
        <div class="modal-header">
          <div class="modal-icon ${type}">
            <i class="modal-icon-${type}"></i>
          </div>
          <h3>${title}</h3>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-confirm ${type}">${confirmText}</button>
        </div>
      </div>
    `;

        // 绑定事件
        const confirmBtn = modal.querySelector('.btn-confirm');
        const overlay = modal;

        confirmBtn.addEventListener('click', onConfirm);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                onConfirm();
            }
        });

        return modal;
    }

    // 移除弹窗
    removeModal(id) {
        const index = this.modals.findIndex(modal => modal.id === id);
        if (index !== -1) {
            const modal = this.modals[index];
            if (modal.element.parentNode) {
                modal.element.parentNode.removeChild(modal.element);
            }
            this.modals.splice(index, 1);
        }
    }

    // 清除所有弹窗
    clearAll() {
        this.modals.forEach(modal => {
            if (modal.element.parentNode) {
                modal.element.parentNode.removeChild(modal.element);
            }
        });
        this.modals = [];
    }
}

// 创建单例
const modalManager = new ModalManager();
export default modalManager;
