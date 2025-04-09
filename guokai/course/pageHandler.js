// 页面处理模块

// 检测当前页面类型
function detectPageType() {
  const activeItem = document.querySelector(
    ".full-screen-mode-sidebar-menu-item.active"
  );
  if (!activeItem) {
    console.log("未找到活动项目，可能页面仍在加载");
    return "加载中";
  }

  const icon = activeItem.querySelector("i.activity-type-icon");
  if (!icon) {
    console.log("未找到图标，可能页面结构有变化");
    return "未知";
  }

  const iconClass = icon.className;
  if (iconClass.includes("font-syllabus-exam")) return "考试";
  if (iconClass.includes("font-syllabus-material")) return "文件";
  if (iconClass.includes("font-syllabus-page")) return "文本";
  if (iconClass.includes("font-syllabus-forum")) return "讨论";
  if (iconClass.includes("font-syllabus-web-link")) return "问卷";
  if (iconClass.includes("font-syllabus-online-video")) return "视频";

  console.log("无法识别的图标类名:", iconClass);
  return "未知";
}

// 检测并更新页面类型
function detectAndUpdatePageType() {
  const pageType = detectPageType();
  console.log("当前页面类型:", pageType);
  const pageTypeDisplay = document.getElementById("page-type-display");
  if (pageTypeDisplay) {
    pageTypeDisplay.textContent = pageType;
  }
  return pageType;
}

// 根据页面类型执行相应操作
function executeActionByPageType() {
  const pageType = detectPageType();
  window.updateStatus(`处理${pageType}页面`);
  window.changeState(window.State.PROCESSING);

  console.log("pageType", pageType);

  switch (pageType) {
    case "文件":
      handleFilePage();
      break;
    case "文本":
      handleTextPage();
      break;
    case "讨论":
      handleDiscussionPage();
      break;
    case "问卷":
      handleSurveyPage();
      break;
    case "视频":
      handleVideoPage();
      break;
    case "考试":
      clickNextButton();
      break;
    default:
      console.log("未知页面类型,跳过到下一个页面");
      clickNextButton();
  }
}

// 处理文件类型页面
async function handleFilePage() {
  await window.sleep(3000);
  window.updateStatus("处理文件页面");
  console.log("处理文件类型页面");
  const tbody = document.querySelector(".ivu-table-tbody");

  if (tbody) {
    const fileRows = tbody.querySelectorAll("tr");
    console.log(`找到 ${fileRows.length} 个文件`);

    for (let i = 0; i < fileRows.length; i++) {
      console.log(`处理第 ${i + 1} 个文件`);
      if (getCurrentState() !== window.State.PROCESSING) {
        console.log("处理被停止");
        window.changeState(window.State.IDLE);
        return;
      }

      const viewButton = fileRows[i].querySelector(
        ".ivu-table-row > td:first-child > div > a"
      );
      viewButton.click();
      console.log("点击查看按钮", viewButton);
      if (waitComplete()) {
        closeFile();
      } else {
        stopProcessing();
        console.error("等待完成时出错");
      }
    }

    console.log("所有文件已处理完毕");
    if (getCurrentState() === window.State.PROCESSING) {
      clickNextButton();
    }
  } else {
    console.log("未找到文件列表");
    clickNextButton();
  }
}

// 关闭文件预览
async function closeFile() {
  console.log("尝试关闭文件");
  await window.sleep(3000);
  const closeButton = document.querySelector(
    "#file-previewer > div > div > div.header.clearfix > a"
  );
  closeButton.click();
}

// 处理文本类型页面
function handleTextPage() {
  window.updateStatus("处理文本页面");
  console.log("处理文本类型页面");
  window.scrollTo(0, document.body.scrollHeight);
  clickNextButton();
}

// 处理讨论类型页面
function handleDiscussionPage() {
  window.updateStatus("处理讨论页面");
  console.log("处理讨论类型页面");
  clickNextButton();
}

// 处理问卷类型页面
function handleSurveyPage() {
  window.updateStatus("处理问卷页面");
  console.log("处理问卷类型页面");
  clickNextButton();
}

// 处理视频类型页面
function handleVideoPage() {
  window.whenForKeyElements(".mvp-fonts.mvp-fonts-play", (element) => {
    console.log("检查到播放器", element);
    window.updateStatus("处理视频页面");
    updateVideoInfo();
    clickNextButton();
  });
}

// 获取当前状态
function getCurrentState() {
  return window.State.PROCESSING; // 简化处理，实际应获取当前状态
}

// 等待完成度达到要求
function waitComplete(maxAttempts = 10, interval = 3000) {
  console.log("等待完成度达到要求");
  let attempts = 0;
  
  // 确保清除之前可能存在的 interval
  clearInterval(window.checkInterval);

  return new Promise((resolve) => {
    window.checkInterval = setInterval(async () => {
      if (getCurrentState() !== window.State.PROCESSING) {
        console.log("处理已停止");
        clearInterval(window.checkInterval);
        resolve(false);
        return;
      }

      if (attempts >= maxAttempts) {
        console.log("达到最大尝试次数，完成度未达到要求");
        clearInterval(window.checkInterval);
        resolve(false);
        return;
      }

      try {
        const completeness = await fetchActivityRead();
        console.log(`第 ${attempts + 1} 次检查完成度: ${completeness}`);
        
        if (completeness >= 80) {
          console.log("完成度达到要求");
          clearInterval(window.checkInterval);
          resolve(true);
          return;
        }
      } catch (error) {
        console.error("获取完成度时出错:", error);
      }

      attempts++;
    }, interval);
  });
}

// 点击下一个按钮
async function clickNextButton(wait = 10) {
  clearInterval(window.checkInterval);
  const nextButton = document.querySelector(
    "button.next-btn.ivu-btn.ivu-btn-default"
  );
  console.log("nextButton", nextButton);

  if (nextButton) {
    window.startProcessCountdown(wait, () => {
      console.log("点击下一个页面 ", nextButton);
      nextButton.click();
    });
  }
}

// 获取活动阅读数据
async function fetchActivityRead() {
  const activityId = window.getCurrentActivityId();
  if (!activityId) {
    console.error("无法获取ActivityId");
    return 0;
  }

  console.log("开始获取活动阅读数据, ActivityId:", activityId);
  try {
    const response = await fetch(
      `https://lms.ouchn.cn/api/course/activities-read/${activityId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: "{}",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("解析的数据:", data);

    if (data.completeness === "full") {
      const completeness = data.data.completeness;
      console.log("完成度:", completeness);
      window.updateCompletenessDisplay(completeness);
      return completeness;
    } else if (data.completeness === "part") {
      console.log("未完成");
      window.updateCompletenessDisplay("未完成");
      return 0;
    } else {
      console.log("未知的完成度状态");
      window.updateCompletenessDisplay("未知的完成度状态");
      return 0;
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    window.updateCompletenessDisplay("获取完成度失败");
    return 0;
  }
}

// 更新视频信息
function updateVideoInfo() {
  const video = document.querySelector("video");
  // end = 从视频信息中获取时间计算出总时长秒 减去 10
  const end = Math.round(video.duration) - 10;
  const activityId = window.getCurrentActivityId();

  if (video) {
    console.log("更新视频信息", end);

    fetch("https://lms.ouchn.cn/api/course/activities-read/" + activityId, {
      headers: {
        accept: "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/json",
        "sec-ch-ua": '"Chromium";v="129", "Not=A?Brand";v="8"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer:
        "https://lms.ouchn.cn/course/40000073312/learning-activity/full-screen",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: '{"start":0,"end":' + end + "}",
      method: "POST",
      mode: "cors",
      credentials: "include",
    });
  }
}

// 处理页面
function processPage() {
  console.log("是否自动处理:", window.configProxy.autoProcessEnabled);

  window.whenForKeyElements(
    ".full-screen-mode-sidebar-menu-item.active",
    (element) => {
      console.log("检测到活动项目", element);
      detectAndUpdatePageType(); // 初始检测页面类型
      if (!window.configProxy.autoProcessEnabled) return;
      executeActionByPageType();
    }
  );
  console.log("---启动完成---");
}

// 停止处理
function stopProcessing() {
  window.updateStatus("自动处理已停止");
  console.log("停止自动处理");
  window.changeState(window.State.STOPPED);
  window.configProxy.autoProcessEnabled = false;
  const autoProcessCheckbox = document.getElementById("auto-process");
  if (autoProcessCheckbox) autoProcessCheckbox.checked = false;

  // 停止所有正在进行的操作
  clearTimeout(window.nextActionTimeout);
  clearTimeout(window.checkCompletenessTimeout);
  clearInterval(window.processCountdown); // 清除倒计时
  clearInterval(window.checkInterval);    // 清除完成度检查interval
  
  // 更新UI以反映停止状态
  window.updateCountdownDisplay("-"); // 重置倒计时显示
  window.updateAutoProcessStatus();
}

// 暴露到全局作用域
window.detectPageType = detectPageType;
window.detectAndUpdatePageType = detectAndUpdatePageType;
window.executeActionByPageType = executeActionByPageType;
window.clickNextButton = clickNextButton;
window.fetchActivityRead = fetchActivityRead;
window.updateVideoInfo = updateVideoInfo;
window.processPage = processPage;
window.stopProcessing = stopProcessing; 