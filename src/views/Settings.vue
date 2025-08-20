<!-- SystemSettings.vue -->
<template>
  <div class="settings-page">
    <div class="page-header">
      <h2>系统设置</h2>
      <p>自定义您的系统外观和偏好设置</p>
    </div>

    <div class="settings-container">
      <!-- 设置分类导航 -->
      <div class="settings-nav">
        <ul>
          <li
              v-for="category in categories"
              :key="category.id"
              :class="{ active: activeCategory === category.id }"
              @click="activeCategory = category.id"
          >
            <i :class="category.icon"></i>
            <span>{{ category.name }}</span>
          </li>
        </ul>
      </div>

      <!-- 设置内容区域 -->
      <div class="settings-content">
        <!-- 外观设置 -->
        <div v-show="activeCategory === 'appearance'" class="settings-section">
          <h3>外观设置</h3>

          <div class="setting-item">
            <label class="setting-label">
              <span>主题颜色</span>
              <span class="setting-description">选择系统的主色调</span>
            </label>
            <div class="setting-control">
              <div class="color-options">
                <div
                    v-for="color in themeColors"
                    :key="color.name"
                    class="color-option"
                    :class="{ active: currentTheme === color.name }"
                    @click="changeTheme(color.name)"
                    :style="{ backgroundColor: color.primary }"
                    :title="color.name"
                >
                  <i v-if="currentTheme === color.name" class="icon-check">✓</i>
                </div>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">
              <span>侧边栏样式</span>
              <span class="setting-description">选择侧边栏的显示样式</span>
            </label>
            <div class="setting-control">
              <div class="skin-options">
                <div
                    v-for="skin in sidebarSkins"
                    :key="skin.name"
                    class="skin-option"
                    :class="{ active: currentSidebarSkin === skin.name }"
                    @click="changeSidebarSkin(skin.name)"
                >
                  <div class="skin-preview" :class="skin.name">
                    <div class="preview-sidebar"></div>
                    <div class="preview-content"></div>
                  </div>
                  <span>{{ skin.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">
              <span>导航栏位置</span>
              <span class="setting-description">选择导航栏的显示位置</span>
            </label>
            <div class="setting-control">
              <div class="radio-group">
                <label class="radio-option">
                  <input
                      type="radio"
                      v-model="navbarPosition"
                      value="top"
                      @change="saveSettings"
                  >
                  <span class="radio-label">顶部</span>
                </label>
                <label class="radio-option">
                  <input
                      type="radio"
                      v-model="navbarPosition"
                      value="side"
                      @change="saveSettings"
                  >
                  <span class="radio-label">侧边</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 语言设置 -->
        <div v-show="activeCategory === 'language'" class="settings-section">
          <h3>语言设置</h3>

          <div class="setting-item">
            <label class="setting-label">
              <span>界面语言</span>
              <span class="setting-description">选择系统显示语言</span>
            </label>
            <div class="setting-control">
              <select v-model="currentLanguage" @change="changeLanguage">
                <option value="zh-CN">简体中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">
              <span>日期格式</span>
              <span class="setting-description">选择日期显示格式</span>
            </label>
            <div class="setting-control">
              <select v-model="dateFormat" @change="saveSettings">
                <option value="yyyy-MM-dd">2023-12-25</option>
                <option value="dd/MM/yyyy">25/12/2023</option>
                <option value="MM/dd/yyyy">12/25/2023</option>
                <option value="yyyy年MM月dd日">2023年12月25日</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 通知设置 -->
        <div v-show="activeCategory === 'notifications'" class="settings-section">
          <h3>通知设置</h3>

          <div class="setting-item">
            <label class="setting-label">
              <span>桌面通知</span>
              <span class="setting-description">允许系统发送桌面通知</span>
            </label>
            <div class="setting-control">
              <label class="switch">
                <input
                    type="checkbox"
                    v-model="desktopNotifications"
                    @change="saveSettings"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">
              <span>邮件通知</span>
              <span class="setting-description">接收重要事件的邮件通知</span>
            </label>
            <div class="setting-control">
              <label class="switch">
                <input
                    type="checkbox"
                    v-model="emailNotifications"
                    @change="saveSettings"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">
              <span>声音提醒</span>
              <span class="setting-description">启用操作完成时的声音提醒</span>
            </label>
            <div class="setting-control">
              <label class="switch">
                <input
                    type="checkbox"
                    v-model="soundNotifications"
                    @change="saveSettings"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 其他设置 -->
        <div v-show="activeCategory === 'general'" class="settings-section">
          <h3>常规设置</h3>

          <div class="setting-item">
            <label class="setting-label">
              <span>自动保存</span>
              <span class="setting-description">自动保存您的编辑内容</span>
            </label>
            <div class="setting-control">
              <label class="switch">
                <input
                    type="checkbox"
                    v-model="autoSave"
                    @change="saveSettings"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">
              <span>启动时检查更新</span>
              <span class="setting-description">程序启动时自动检查更新</span>
            </label>
            <div class="setting-control">
              <label class="switch">
                <input
                    type="checkbox"
                    v-model="checkUpdates"
                    @change="saveSettings"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">
              <span>数据同步频率</span>
              <span class="setting-description">设置数据自动同步的时间间隔</span>
            </label>
            <div class="setting-control">
              <select v-model="syncFrequency" @change="saveSettings">
                <option value="5">每5分钟</option>
                <option value="15">每15分钟</option>
                <option value="30">每30分钟</option>
                <option value="60">每小时</option>
                <option value="0">手动同步</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="settings-actions">
      <button class="btn-secondary" @click="resetSettings">恢复默认设置</button>
      <button class="btn-primary" @click="saveSettings">保存设置</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemSettings',
  data() {
    return {
      activeCategory: 'appearance',
      categories: [
        {id: 'appearance', name: '外观', icon: 'icon-appearance'},
        {id: 'language', name: '语言', icon: 'icon-language'},
        {id: 'notifications', name: '通知', icon: 'icon-notification'},
        {id: 'general', name: '常规', icon: 'icon-general'}
      ],

      // 外观设置
      themeColors: [
        {name: 'default', primary: '#3498db', secondary: '#2c3e50'},
        {name: 'green', primary: '#27ae60', secondary: '#2ecc71'},
        {name: 'purple', primary: '#9b59b6', secondary: '#8e44ad'},
        {name: 'orange', primary: '#e67e22', secondary: '#d35400'},
        {name: 'red', primary: '#e74c3c', secondary: '#c0392b'}
      ],
      currentTheme: 'default',

      sidebarSkins: [
        {name: 'light', label: '浅色'},
        {name: 'dark', label: '深色'},
        {name: 'colorful', label: '彩色'}
      ],
      currentSidebarSkin: 'light',
      navbarPosition: 'side',

      // 语言设置
      currentLanguage: 'zh-CN',
      dateFormat: 'yyyy-MM-dd',

      // 通知设置
      desktopNotifications: true,
      emailNotifications: false,
      soundNotifications: true,

      // 常规设置
      autoSave: true,
      checkUpdates: true,
      syncFrequency: '15'
    }
  },

  mounted() {
    this.loadSettings()
  },

  methods: {
    loadSettings() {
      const savedSettings = localStorage.getItem('systemSettings')
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          Object.assign(this, settings)
        } catch (e) {
          console.error('加载设置失败:', e)
        }
      }
    },

    saveSettings() {
      const settings = {
        currentTheme: this.currentTheme,
        currentSidebarSkin: this.currentSidebarSkin,
        navbarPosition: this.navbarPosition,
        currentLanguage: this.currentLanguage,
        dateFormat: this.dateFormat,
        desktopNotifications: this.desktopNotifications,
        emailNotifications: this.emailNotifications,
        soundNotifications: this.soundNotifications,
        autoSave: this.autoSave,
        checkUpdates: this.checkUpdates,
        syncFrequency: this.syncFrequency
      }

      localStorage.setItem('systemSettings', JSON.stringify(settings))

      // 应用主题
      this.applyTheme()

      // 显示保存成功提示（如果使用了消息组件）
      if (this.$message) {
        this.$message.success('设置已保存')
      } else {
        // 简单的alert提示
        alert('设置已保存')
      }
    },

    resetSettings() {
      if (confirm('确定要恢复默认设置吗？这将丢失所有自定义设置。')) {
        // 重置为默认值
        this.currentTheme = 'default'
        this.currentSidebarSkin = 'light'
        this.navbarPosition = 'side'
        this.currentLanguage = 'zh-CN'
        this.dateFormat = 'yyyy-MM-dd'
        this.desktopNotifications = true
        this.emailNotifications = false
        this.soundNotifications = true
        this.autoSave = true
        this.checkUpdates = true
        this.syncFrequency = '15'

        this.saveSettings()
      }
    },

    changeTheme(themeName) {
      this.currentTheme = themeName
      this.saveSettings()
    },

    changeSidebarSkin(skinName) {
      this.currentSidebarSkin = skinName
      this.saveSettings()
    },

    changeLanguage() {
      this.saveSettings()
    },

    applyTheme() {
      // 移除所有主题类
      const themes = ['default', 'green', 'purple', 'orange', 'red']
      themes.forEach(theme => {
        document.body.classList.remove(`theme-${theme}`)
      })

      // 添加当前主题类
      document.body.classList.add(`theme-${this.currentTheme}`)
    }
  }
}
</script>

<style scoped>
.settings-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.page-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.settings-container {
  display: flex;
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.settings-nav {
  width: 200px;
  background: #f8f9fa;
  border-right: 1px solid #eee;
}

.settings-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.settings-nav li {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.settings-nav li:hover {
  background: #e9ecef;
}

.settings-nav li.active {
  background: #e3f2fd;
  border-left-color: #3498db;
  color: #3498db;
}

.settings-nav i {
  margin-right: 10px;
  font-size: 1.2rem;
}

.settings-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.settings-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.3rem;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.setting-item {
  display: flex;
  align-items: flex-start;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.setting-label span:first-child {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 5px;
}

.setting-description {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.setting-control {
  width: 300px;
}

/* 颜色选项 */
.color-options {
  display: flex;
  gap: 10px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #2c3e50;
  transform: scale(1.1);
}

.color-option .icon-check {
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

/* 皮肤选项 */
.skin-options {
  display: flex;
  gap: 15px;
}

.skin-option {
  text-align: center;
  cursor: pointer;
}

.skin-preview {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0px;
  border: 1px solid #ddd;
}

.preview-sidebar {
  width: 30%;
  height: 100%;
  float: left;
}

.preview-content {
  width: 70%;
  height: 100%;
  float: right;
}

.skin-option.light .preview-sidebar {
  background: #2c3e50;
}

.skin-option.light .preview-content {
  background: #ecf0f1;
}

.skin-option.dark .preview-sidebar {
  background: #1a1a1a;
}

.skin-option.dark .preview-content {
  background: #2c2c2c;
}

.skin-option.colorful .preview-sidebar {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.skin-option.colorful .preview-content {
  background: #f0f0f0;
}

.skin-option.active .skin-preview {
  border-color: #3498db;
  box-shadow: 0 0 0 2px #3498db;
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  gap: 20px;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-option input {
  margin-right: 8px;
}

/* 开关按钮 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3498db;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* 下拉选择框 */
.setting-control select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.setting-control select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

/* 操作按钮 */
.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 0;
  margin-top: auto;
}

.btn-primary, .btn-secondary {
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  box-shadow: 0 2px 5px rgba(52, 152, 219, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2980b9, #2573a7);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.4);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
}

/* 图标样式 */
.icon-appearance::before {
  content: "🎨";
}

.icon-language::before {
  content: "🌐";
}

.icon-notification::before {
  content: "🔔";
}

.icon-general::before {
  content: "⚙️";
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
  }

  .settings-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eee;
  }

  .settings-nav ul {
    display: flex;
    overflow-x: auto;
  }

  .settings-nav li {
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .settings-nav li.active {
    border-left: none;
    border-bottom: 3px solid #3498db;
  }

  .setting-item {
    flex-direction: column;
    gap: 10px;
  }

  .setting-control {
    width: 100%;
  }

  .settings-actions {
    flex-direction: column;
  }
}
</style>