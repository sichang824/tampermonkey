// 配置管理模块
window.CONFIG = {
  // 默认配置
  defaultConfig: {
    autoProcessEnabled: false,
    isDarkMode: false,
    volume: 100,
    playbackSpeed: 1.5,
    isPanelHidden: false,
    autoStart: false,
    showLog: true,
    minDelay: 3000,
    maxDelay: 5000
  },

  // 配置对象
  config: {},

  // 初始化配置代理
  init: function() {
    // 创建配置对象
    this.config = { ...this.defaultConfig };

    // 创建配置代理
    window.configProxy = new Proxy(this.config, {
      set: (target, key, value) => {
        target[key] = value;
        this.saveConfig();
        return true;
      }
    });
  },

  // 从localStorage加载配置
  loadConfig: function() {
    // 确保初始化
    if (!window.configProxy) {
      this.init();
    }
    
    const savedConfig = JSON.parse(localStorage.getItem("scriptConfig")) || {};
    Object.keys(this.config).forEach((key) => {
      if (savedConfig.hasOwnProperty(key)) {
        window.configProxy[key] = savedConfig[key];
      }
    });
    
    console.log("配置已加载", window.configProxy);
  },

  // 保存配置到localStorage
  saveConfig: function() {
    localStorage.setItem("scriptConfig", JSON.stringify(this.config));
    console.log("配置已保存", this.config);
  },

  // 重置配置
  resetConfig: function() {
    Object.keys(this.defaultConfig).forEach((key) => {
      window.configProxy[key] = this.defaultConfig[key];
    });
    console.log("配置已重置为默认值");
  }
}; 