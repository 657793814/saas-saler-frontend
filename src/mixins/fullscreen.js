// src/mixins/fullscreen.js
export default {
    mounted() {
        this.applyFullscreenStyles();
    },
    methods: {
        applyFullscreenStyles() {
            // 确保当前组件全屏显示
            if (this.$el) {
                this.$el.style.height = '100%';
                this.$el.style.width = '100%';
                this.$el.style.overflow = 'hidden';
            }
        }
    }
}