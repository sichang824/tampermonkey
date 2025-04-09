// 通用辅助函数模块
window.HELPERS = {
  // 等待元素加载辅助函数
  whenForKeyElements: function (
    selector,
    callback,
    timeout = 60000,
    fallback = null
  ) {
    window.HELPERS.log(`等待元素: ${selector}，超时时间: ${timeout}ms`, "info");
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
      return;
    }

    let timeoutId = setTimeout(() => {
      observer.disconnect();
      if (fallback) {
        fallback(new Error(`Timeout waiting for element: ${selector}`));
      } else {
        window.location.reload();
      }
    }, timeout);

    const observer = new MutationObserver((mutationsList, observer) => {
      const element = document.querySelector(selector);
      if (element) {
        clearTimeout(timeoutId);
        callback(element);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },

  // 获取当前ActivityId
  getCurrentActivityId: function () {
    const url = window.location.href;
    const match = url.match(/\/(\d+)$/);
    return match ? match[1] : null;
  },

  // 等待指定毫秒数
  sleep: function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  // 创建随机延迟，在min和max之间
  randomDelay: function (min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.sleep(delay);
  },

  // 格式化时间为 HH:MM:SS
  formatTime: function (seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  },

  // 检查网络连接状态
  isOnline: function () {
    return navigator.onLine;
  },

  // 简单的日志函数，包含时间戳
  log: function (message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    switch (type) {
      case "error":
        console.error(`${prefix} ${message}`);
        break;
      case "warn":
        console.warn(`${prefix} ${message}`);
        break;
      case "debug":
        console.debug(`${prefix} ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  },
};

// 创建按钮HTML
function createButton(id, text) {
  return `<button id="${id}">${text}</button>`;
}

// 创建复选框HTML
function createCheckbox(id, label, checked) {
  return `
    <div>
      <label for="${id}">
        <input type="checkbox" id="${id}" ${checked ? "checked" : ""}>
        ${label}
      </label>
    </div>
  `;
}

// 暴露到全局作用域
window.createButton = createButton;
window.createCheckbox = createCheckbox;
