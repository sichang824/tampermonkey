// 配置管理模块

// 默认配置
const defaultConfig = {
  autoProcessEnabled: false,
  isDarkMode: false,
  volume: 100,
  playbackSpeed: 1,
  isPanelHidden: false,
};

// 创建配置对象
const config = { ...defaultConfig };

// 创建配置代理
const configProxy = new Proxy(config, {
  set(target, key, value) {
    target[key] = value;
    saveConfig();
    return true;
  },
});

// 从localStorage加载配置
function loadConfig() {
  const savedConfig = JSON.parse(localStorage.getItem("scriptConfig")) || {};
  Object.keys(config).forEach((key) => {
    if (savedConfig.hasOwnProperty(key)) {
      configProxy[key] = savedConfig[key];
    }
  });
}

// 保存配置到localStorage
function saveConfig() {
  localStorage.setItem("scriptConfig", JSON.stringify(config));
}

// 暴露到全局作用域
window.configProxy = configProxy;
window.loadConfig = loadConfig; 