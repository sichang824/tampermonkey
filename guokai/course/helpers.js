// 通用辅助函数模块

// 等待元素加载辅助函数
function whenForKeyElements(selector, callback) {
  const targetNode = document.body;
  const config = { childList: true, subtree: true, attributes: true };

  let previousElement = null;

  function checkForElements() {
    const element = document.querySelector(selector);
    if (element && element !== previousElement) {
      callback(element);
      previousElement = element;
    }
  }

  // 立即检查一次
  checkForElements();

  const observer = new MutationObserver((mutationsList, observer) => {
    let shouldCheck = false;

    // 检查变化是否与我们关心的选择器相关
    for (let mutation of mutationsList) {
      if (mutation.type === "childList" || mutation.type === "attributes") {
        shouldCheck = true;
        break;
      }
    }

    if (shouldCheck) {
      checkForElements();
    }
  });

  observer.observe(targetNode, config);

  return () => observer.disconnect();
}

// 获取当前ActivityId
function getCurrentActivityId() {
  const url = window.location.href;
  const match = url.match(/\/(\d+)$/);
  return match ? match[1] : null;
}

// 等待指定毫秒数
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
window.whenForKeyElements = whenForKeyElements;
window.getCurrentActivityId = getCurrentActivityId;
window.sleep = sleep;
window.createButton = createButton;
window.createCheckbox = createCheckbox; 