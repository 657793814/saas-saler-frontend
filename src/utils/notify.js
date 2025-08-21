// src/utils/notify.js
import modalManager from './modalManager';
import toastManager from './toastManager';

const notify = {
    // 确认弹窗
    async confirm(message, options = {}) {
        const {
            title = '确认操作',
            type = 'warning',
            confirmText = '确定',
            cancelText = '取消'
        } = options;

        return await modalManager.confirm({
            title,
            message,
            type,
            confirmText,
            cancelText
        });
    },

    // 提示弹窗
    async alert(message, options = {}) {
        const {
            title = '提示',
            type = 'info',
            confirmText = '确定'
        } = options;

        return await modalManager.alert({
            title,
            message,
            type,
            confirmText
        });
    },

    // Toast 提示
    toast(message, type = 'info', duration = 3000) {
        toastManager.show(message, type, duration);
    },

    // 成功提示
    success(message, duration) {
        this.toast(message, 'success', duration);
    },

    // 错误提示
    error(message, duration) {
        this.toast(message, 'error', duration);
    },

    // 警告提示
    warning(message, duration) {
        this.toast(message, 'warning', duration);
    },

    // 信息提示
    info(message, duration) {
        this.toast(message, 'info', duration);
    }
};

export default notify;
