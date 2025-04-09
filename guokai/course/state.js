// 状态管理模块
window.STATE = {
  // 状态常量
  State: {
    IDLE: "idle",
    PROCESSING: "processing",
    STOPPED: "stopped",
  },

  // 当前状态
  currentState: "idle",
  currentStatus: "就绪",

  // 全局计时器
  processCountdown: null,
  checkInterval: null,

  // 获取上次动作时间
  getLastActionTime: function() {
    return this.lastActionTime || Date.now();
  },

  // 更新上次动作时间
  updateLastActionTime: function() {
    this.lastActionTime = Date.now();
  },

  // 修改状态的函数
  changeState: function(newState) {
    this.currentState = newState;
    this.updateStatusDisplay();
  },

  // 更新状态显示
  updateStatusDisplay: function() {
    const statusDisplay = document.getElementById("current-status");
    const processingStatus = document.getElementById("processing-status");
    if (statusDisplay) {
      statusDisplay.textContent = this.currentStatus;
    }
    if (processingStatus) {
      processingStatus.textContent = this.currentState;
    }
  },

  // 更新状态文本
  updateStatus: function(status) {
    this.currentStatus = status;
    const statusDisplay = document.getElementById("current-status");
    if (statusDisplay) {
      statusDisplay.textContent = status;
    }
  },

  // 更新倒计时的函数
  startProcessCountdown: function(seconds, callback) {
    clearInterval(this.processCountdown);
    this.updateCountdownDisplay(seconds);
    this.processCountdown = setInterval(() => {
      seconds--;
      console.log("倒计时: ", seconds);
      if (seconds >= 0) {
        this.updateCountdownDisplay(seconds);
      } else {
        callback?.();
        clearInterval(this.processCountdown);
      }
    }, 1000);
  },

  // 更新倒计时显示的函数
  updateCountdownDisplay: function(text) {
    const countdownDisplay = document.getElementById("countdown-display");
    if (countdownDisplay) {
      countdownDisplay.textContent = text;
    }
  },

  // 获取当前状态
  getCurrentState: function() {
    return this.currentState;
  },

  // 获取当前状态文本
  getCurrentStatus: function() {
    return this.currentStatus;
  }
}; 