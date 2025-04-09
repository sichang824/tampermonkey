// 状态管理模块

// 状态常量
const State = {
  IDLE: "idle",
  PROCESSING: "processing",
  STOPPED: "stopped",
};

// 当前状态
let currentState = State.IDLE;
let currentStatus = "就绪";

// 全局计时器
let processCountdown;
let checkInterval;

// 修改状态的函数
function changeState(newState) {
  currentState = newState;
  updateStatusDisplay();
}

// 更新状态显示
function updateStatusDisplay() {
  const statusDisplay = document.getElementById("current-status");
  const processingStatus = document.getElementById("processing-status");
  if (statusDisplay) {
    statusDisplay.textContent = currentStatus;
  }
  if (processingStatus) {
    processingStatus.textContent = currentState;
  }
}

// 更新状态文本
function updateStatus(status) {
  currentStatus = status;
  const statusDisplay = document.getElementById("current-status");
  if (statusDisplay) {
    statusDisplay.textContent = status;
  }
}

// 更新倒计时的函数
function startProcessCountdown(seconds, callback) {
  clearInterval(processCountdown);
  updateCountdownDisplay(seconds);
  processCountdown = setInterval(() => {
    seconds--;
    console.log("倒计时: ", seconds);
    if (seconds >= 0) {
      updateCountdownDisplay(seconds);
    } else {
      callback?.();
      clearInterval(processCountdown);
    }
  }, 1000);
}

// 更新倒计时显示的函数
function updateCountdownDisplay(text) {
  const countdownDisplay = document.getElementById("countdown-display");
  if (countdownDisplay) {
    countdownDisplay.textContent = text;
  }
}

// 获取当前状态
function getCurrentState() {
  return currentState;
}

// 获取当前状态文本
function getCurrentStatus() {
  return currentStatus;
}

// 暴露到全局作用域
window.State = State;
window.changeState = changeState;
window.updateStatus = updateStatus;
window.startProcessCountdown = startProcessCountdown;
window.updateCountdownDisplay = updateCountdownDisplay;
window.getCurrentState = getCurrentState;
window.getCurrentStatus = getCurrentStatus;
window.processCountdown = processCountdown;
window.checkInterval = checkInterval; 