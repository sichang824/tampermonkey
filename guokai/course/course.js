// ==UserScript==
// @name         国开刷课
// @namespace    http://tampermonkey.net/
// @version      2024-10-12
// @description  国开刷课辅助工具
// @author       You
// @match        https://lms.ouchn.cn/course/*/learning-activity/full-screen
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ouchn.cn
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // 创建配置对象
  const config = {
    autoProcessEnabled: false,
    isDarkMode: false,
    volume: 100,
    playbackSpeed: 1,
    isPanelHidden: false,
  };

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

  // 初始加载配
  loadConfig();

  // 获取当前ActivityId
  function getCurrentActivityId() {
    const url = window.location.href;
    const match = url.match(/\/(\d+)$/);
    return match ? match[1] : null;
  }

  let currentStatus = "就绪";

  // 在全局变量部分添加状态机
  const State = {
    IDLE: "idle",
    PROCESSING: "processing",
    STOPPED: "stopped",
  };

  let currentState = State.IDLE;

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

  // 在全局范围内添加一个变量来存储倒计时
  let processCountdown;
  let checkInterval;

  // 重构后的 createControlPanel 函数
  function createControlPanel() {
    const panel = document.createElement("div");
    panel.id = "control-panel";

    const panelContent = `
      <div class="panel-header">
        <button id="toggle-panel" class="toggle-btn">隐藏</button>
        <div id="drag-handle"></div>
      </div>
      <div id="panel-body">
        <h3>国开刷课助手</h3>
        <div>当前类型: <span id="page-type-display">未知</span></div>
        <div>当前状态: <span id="current-status">${currentStatus}</span></div>
        <div>进度: <span id="progress-display">0</span>%</div>
        <div class="slider-container">
          音量: <input type="range" id="volume-slider" min="0" max="100" value="${
            configProxy.volume
          }">
          <span id="volume-display">${configProxy.volume}</span>%
        </div>
        <div class="slider-container">
          播放速度: <input type="range" id="speed-slider" min="1" max="16" value="${
            configProxy.playbackSpeed
          }">
          <span id="speed-display">${configProxy.playbackSpeed}</span>x
        </div>
        <div>完成度: <span id="completeness-display">未知</span></div>
        <div>自动处理: <span id="auto-process-status">${
          configProxy.autoProcessEnabled ? "开启" : "关闭"
        }</span></div>
        <div>下一步倒计时: <span id="countdown-display">-</span></div>
        ${createButton("fetch-completeness", "获取完成度")}
        ${createButton("next-btn", "下一个")}
        ${createButton("auto-process-btn", "自动处理")}
        ${createButton("complete-video", "完成视频")}
        ${createButton("stop-btn", "停止")}
        ${createCheckbox(
          "auto-process",
          "自动处理",
          configProxy.autoProcessEnabled
        )}
        ${createCheckbox("dark-mode", "黑暗模式", configProxy.isDarkMode)}
      </div>
    `;

    panel.innerHTML = panelContent;
    document.body.appendChild(panel);

    // 添加滑块样式
    const style = document.createElement("style");
    style.textContent = `
      .slider-container {
        margin: 10px 0;
      }
      input[type="range"] {
        width: 100%;
        margin: 5px 0;
      }
    `;
    document.head.appendChild(style);

    updatePanelStyle(panel);
    addEventListeners(panel);
  }

  // 辅助函数: 创建按钮
  function createButton(id, text) {
    return `<button id="${id}">${text}</button>`;
  }

  // 辅助函数: 创建复选框
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

  // 重构后的 updatePanelStyle 函数
  function updatePanelStyle(panel) {
    const baseStyle = {
      position: "fixed",
      top: "10px",
      right: "10px",
      padding: "15px",
      borderRadius: "10px",
      zIndex: "9999",
      width: "250px",
      fontFamily: "Arial, sans-serif",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "background-color 0.3s, color 0.3s",
    };

    const modeStyle = configProxy.isDarkMode
      ? {
          backgroundColor: "rgba(40, 44, 52, 0.9)",
          color: "#ffffff",
        }
      : {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          color: "#333",
        };

    Object.assign(panel.style, baseStyle, modeStyle);

    // 更新子元素的样式
    panel.querySelectorAll("*").forEach((el) => {
      el.style.color = configProxy.isDarkMode ? "#ffffff" : "";
    });

    // 特别处理按钮和输入框
    panel.querySelectorAll("button").forEach((btn) => {
      Object.assign(btn.style, {
        backgroundColor: configProxy.isDarkMode ? "#61afef" : "",
        color: configProxy.isDarkMode ? "#282c34" : "",
      });
    });

    panel.querySelectorAll('input[type="range"]').forEach((input) => {
      input.style.backgroundColor = configProxy.isDarkMode ? "#61afef" : "";
    });

    // 设置拖动手柄样式
    const dragHandle = panel.querySelector("#drag-handle");
    if (dragHandle) {
      Object.assign(dragHandle.style, {
        position: "absolute",
        top: "0",
        right: "0",
        width: "20px",
        height: "20px",
        backgroundColor: "#5c6370",
        borderTopRightRadius: "10px",
        cursor: "move",
      });
    }

    // 添加面板头部样式
    const panelHeader = panel.querySelector('.panel-header');
    if (panelHeader) {
        Object.assign(panelHeader.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginBottom: '10px'
        });
    }

    // 添加切换按钮样式
    const toggleBtn = panel.querySelector('.toggle-btn');
    if (toggleBtn) {
        Object.assign(toggleBtn.style, {
            marginRight: '10px',
            padding: '2px 8px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: configProxy.isDarkMode ? '#61afef' : '#e6e6e6',
            color: configProxy.isDarkMode ? '#282c34' : '#333',
            border: 'none',
            borderRadius: '4px'
        });
    }
  }

  // 优化后的 addEventListeners 函数
  function addEventListeners(panel) {
    const eventMap = {
      "drag-handle": {
        event: "mousedown",
        handler: (e) => makeDraggable(panel, e.target),
      },
      "fetch-completeness": { event: "click", handler: fetchActivityRead },
      "next-btn": { event: "click", handler: clickNextButton },
      "auto-process": {
        event: "change",
        handler: (e) => {
          configProxy.autoProcessEnabled = e.target.checked;
          updateAutoProcessStatus();
          if (configProxy.autoProcessEnabled) {
            executeActionByPageType();
          }
        },
      },
      "dark-mode": {
        event: "change",
        handler: (e) => {
          configProxy.isDarkMode = e.target.checked;
          updatePanelStyle(panel);
        },
      },
      "auto-process-btn": {
        event: "click",
        handler: () => {
          changeState(State.PROCESSING);
          const pageType = detectPageType();
          updateStatus(`手动触发自动处理，当前页面类型: ${pageType}`);
          executeActionByPageType();
        },
      },
      "stop-btn": { event: "click", handler: stopProcessing },
      "complete-video": {
        event: "click",
        handler: () => {
          const video = document.querySelector("video");
          if (video) {
            try {
              // 使用老式的方式设置视频参数和播放
              video.volume = configProxy.volume / 100;
              video.playbackRate = Math.min(
                16,
                Math.max(1, Number(configProxy.playbackSpeed))
              );

              // 使用老式的方式播放视频
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log("视频开始播放");
                    updateStatus("视频正在播放");
                  })
                  .catch((error) => {
                    console.warn("播放失败，尝试替代方法:", error);
                    // 尝试替代方法
                    setTimeout(() => {
                      try {
                        video.play();
                      } catch (e) {
                        console.error("视频播放失败:", e);
                        updateStatus("视频播放失败");
                      }
                    }, 1000);
                  });
              }

              updateStatus("正在完成视频播放");
            } catch (error) {
              console.error("设置视频参数失败:", error);
              updateStatus("设置视频参数失败");
            }
          } else {
            updateStatus("未找到视频元素");
          }
        },
      },
    };

    Object.entries(eventMap).forEach(([id, { event, handler }]) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener(event, handler);
      }
    });

    // 添加音量控制
    const volumeSlider = document.getElementById("volume-slider");
    const volumeDisplay = document.getElementById("volume-display");
    if (volumeSlider && volumeDisplay) {
      // 设置初始值
      volumeSlider.value = configProxy.volume;
      volumeDisplay.textContent = configProxy.volume;

      volumeSlider.addEventListener("input", (e) => {
        const volume = e.target.value;
        volumeDisplay.textContent = volume;
        configProxy.volume = volume; // 保存到配置
        const video = document.querySelector("video");
        if (video) {
          video.volume = volume / 100;
        }
      });
    }

    // 添加播放速度控制
    const speedSlider = document.getElementById("speed-slider");
    const speedDisplay = document.getElementById("speed-display");
    if (speedSlider && speedDisplay) {
      // 设置初始值
      speedSlider.value = configProxy.playbackSpeed;
      speedDisplay.textContent = configProxy.playbackSpeed;

      speedSlider.addEventListener("input", (e) => {
        const speed = Math.min(16, Math.max(1, Number(e.target.value)));
        speedDisplay.textContent = speed;
        configProxy.playbackSpeed = speed; // 保存到配置
        const video = document.querySelector("video");
        if (video) {
          try {
            video.playbackRate = speed;
          } catch (error) {
            console.error("设置播放速度失败:", error);
            updateStatus("设置播放速度失败");
          }
        }
      });
    }

    // 监听视频元素的变化
    whenForKeyElements("video", (video) => {
      // 设置初始音量
      const volumeSlider = document.getElementById("volume-slider");
      if (volumeSlider) {
        video.volume = volumeSlider.value / 100;
      }

      // 设置初始播放速度
      const speedSlider = document.getElementById("speed-slider");
      if (speedSlider) {
        video.playbackRate = Number(speedSlider.value);
      }

      // 添加视频进度监听
      video.addEventListener("timeupdate", () => {
        // 计算视频进度百分比
        const progress = (video.currentTime / video.duration) * 100;

        // 更新进度显示
        const progressDisplay = document.getElementById("progress-display");
        if (progressDisplay) {
          progressDisplay.textContent = Math.round(progress);
        }

        // 当进度达到100%时自动点击下一页
        if (progress >= 99.5) {
          // 使用99.5%作为阈值,避免可能的精度问题
          console.log("视频播放完成,准备跳转下一页");
          updateVideoInfo();
          fetchActivityRead();
          clickNextButton(3);
        }
      });

      // 添加视频错误处理
      video.addEventListener("error", (e) => {
        console.error("视频加载出错:", e);
        updateStatus("视频加载失败");
      });
    });

    // 添加面板切换功能
    const toggleBtn = document.getElementById('toggle-panel');
    const panelBody = document.getElementById('panel-body');
    
    if (toggleBtn && panelBody) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = panelBody.style.display === 'none';
            panelBody.style.display = isHidden ? 'block' : 'none';
            toggleBtn.textContent = isHidden ? '隐藏' : '显示';
            
            // 保存状态到配置
            configProxy.isPanelHidden = !isHidden;
        });

        // 初始化面板状态
        if (configProxy.isPanelHidden) {
            panelBody.style.display = 'none';
            toggleBtn.textContent = '显示';
        }
    }
  }

  // 新增函数: 更新自动处理状态显示
  function updateAutoProcessStatus() {
    const autoProcessStatus = document.getElementById("auto-process-status");
    if (autoProcessStatus) {
      autoProcessStatus.textContent = configProxy.autoProcessEnabled
        ? "开启"
        : "关闭";
    }
  }

  // 优化后的 makeDraggable 函数
  function makeDraggable(element, handle) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    handle.addEventListener("mousedown", startDragging);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDragging);
    function startDragging(e) {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = element.offsetLeft;
      startTop = element.offsetTop;
    }
    function drag(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newLeft = Math.max(
        0,
        Math.min(startLeft + dx, window.innerWidth - element.offsetWidth)
      );
      const newTop = Math.max(
        0,
        Math.min(startTop + dy, window.innerHeight - element.offsetHeight)
      );
      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
    }
    function stopDragging() {
      isDragging = false;
    }
    // 返回一个函数,用于移除事件监听器
    return function cleanup() {
      handle.removeEventListener("mousedown", startDragging);
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stopDragging);
    };
  }

  // 更新视频信息
  function updateVideoInfo() {
    const video = document.querySelector("video");
    // end = 从视频信息中获取时间计算出总时长秒 减去 10
    const end = Math.round(video.duration) - 10;
    const activityId = getCurrentActivityId();

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

  // 获取活动阅读数据
  async function fetchActivityRead() {
    const activityId = getCurrentActivityId();
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
        updateCompletenessDisplay(completeness);
        return completeness;
      } else if (data.completeness === "part") {
        console.log("未完成");
        updateCompletenessDisplay("未完成");
        return 0;
      } else {
        console.log("未知的完成度状态");
        updateCompletenessDisplay("未知的完成度状态");
        return 0;
      }
    } catch (error) {
      console.error("获取数据失败:", error);
      updateCompletenessDisplay("获取完成度失败");
      return 0;
    }
  }

  // 更新完成度显示
  function updateCompletenessDisplay(completeness) {
    const completenessDisplay = document.getElementById("completeness-display");
    if (completenessDisplay) {
      completenessDisplay.textContent = `${completeness}%`;
    }
  }

  // 修改 clickNextButton 函数
  async function clickNextButton(wait = 10) {
    clearInterval(checkInterval);
    const nextButton = document.querySelector(
      "button.next-btn.ivu-btn.ivu-btn-default"
    );
    console.log("nextButton", nextButton);

    if (nextButton) {
      startProcessCountdown(wait, () => {
        console.log("点击下一个页面 ", nextButton);
        nextButton.click();
      });
    }
  }

  function waitComplete(maxAttempts = 10, interval = 3000) {
    console.log("等待完成度达到要求");
    let attempts = 0;
    
    // 确保清除之前可能存在的 interval
    clearInterval(checkInterval);

    return new Promise((resolve) => {
      checkInterval = setInterval(async () => {
        if (currentState !== State.PROCESSING) {
          console.log("处理已停止");
          clearInterval(checkInterval);
          resolve(false);
          return;
        }

        if (attempts >= maxAttempts) {
          console.log("达到最大尝试次数，完成度未达到要求");
          clearInterval(checkInterval);
          resolve(false);
          return;
        }

        try {
          const completeness = await fetchActivityRead();
          console.log(`第 ${attempts + 1} 次检查完成度: ${completeness}`);
          
          if (completeness >= 80) {
            console.log("完成度达到要求");
            clearInterval(checkInterval);
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
  
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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

  // 新增函数：检测并更新页面类型
  function detectAndUpdatePageType() {
    const pageType = detectPageType();
    console.log("当前页面类型:", pageType);
    const pageTypeDisplay = document.getElementById("page-type-display");
    if (pageTypeDisplay) {
      pageTypeDisplay.textContent = pageType;
    }
    return pageType;
  }

  function executeActionByPageType() {
    const pageType = detectPageType();
    updateStatus(`处理${pageType}页面`);
    changeState(State.PROCESSING);

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

  async function handleFilePage() {
    await sleep(3000);
    updateStatus("处理文件页面");
    console.log("处理文件类型页面");
    const tbody = document.querySelector(".ivu-table-tbody");

    if (tbody) {
      const fileRows = tbody.querySelectorAll("tr");
      console.log(`找到 ${fileRows.length} 个文件`);

      for (let i = 0; i < fileRows.length; i++) {
        console.log(`处理第 ${i + 1} 个文件`);
        if (currentState !== State.PROCESSING) {
          console.log("处理被停止");
          changeState(State.IDLE);
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
      if (currentState === State.PROCESSING) {
        clickNextButton();
      }
    } else {
      console.log("未找到文件列表");
      clickNextButton();
    }
  }

  async function closeFile() {
    console.log("尝试关闭文件");
    await sleep(3000);
    const closeButton = document.querySelector(
      "#file-previewer > div > div > div.header.clearfix > a"
    );
    closeButton.click();
  }

  // 处理文本类型页面
  function handleTextPage() {
    updateStatus("处理文本页面");
    console.log("处理文本类型页面");
    window.scrollTo(0, document.body.scrollHeight);
    clickNextButton();
  }

  // 处理讨论类型页面
  function handleDiscussionPage() {
    updateStatus("处理讨论页面");
    console.log("处理讨论类型页面");
    // 这里可以添加自动回复讨论的逻辑,如果需要的话
    clickNextButton();
  }

  // 处理问卷类型页面
  function handleSurveyPage() {
    updateStatus("处理问卷页面");
    console.log("处理问卷类型页面");
    // 这里可以添加自动填写问卷的逻辑,如果需要的话
    clickNextButton();
  }

  // 处理视频类型页面
  function handleVideoPage() {
    whenForKeyElements(".mvp-fonts.mvp-fonts-play", (element) => {
      console.log("检查到播放器", element);
      updateStatus("处理视频页面");
      updateVideoInfo();
      clickNextButton();
    });
  }

  // 添加停止处理函数
  function stopProcessing() {
    updateStatus("自动处理已停止");
    console.log("停止自动处理");
    changeState(State.STOPPED);
    configProxy.autoProcessEnabled = false;
    const autoProcessCheckbox = document.getElementById("auto-process");
    if (autoProcessCheckbox) autoProcessCheckbox.checked = false;

    // 停止所有正在进行的操作
    clearTimeout(window.nextActionTimeout);
    clearTimeout(window.checkCompletenessTimeout);
    clearInterval(processCountdown); // 清除倒计时
    clearInterval(checkInterval);    // 清除完成度检查interval
    
    // 更新UI以反映停止状态
    updateCountdownDisplay("-"); // 重置倒计时显示
  }

  // 添加更新状态的函数
  function updateStatus(status) {
    currentStatus = status;
    const statusDisplay = document.getElementById("current-status");
    if (statusDisplay) {
      statusDisplay.textContent = status;
    }
  }

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

  // 修改 processPage 函数
  function processPage() {
    console.log("是否自动处理:", configProxy.autoProcessEnabled);

    whenForKeyElements(
      ".full-screen-mode-sidebar-menu-item.active",
      (element) => {
        console.log("检测到活动项目", element);
        detectAndUpdatePageType(); // 初始检测页面类型
        if (!configProxy.autoProcessEnabled) return;
        executeActionByPageType();
      }
    );
    console.log("---启动完成---");
  }

  // 修改初始化部分
  function initialize() {
    createControlPanel();
    changeState(State.IDLE);
    processPage(); // 在初始化时就开始处理页面
  }

  // 修改window.onload事件监听器
  window.addEventListener("load", () => {
    console.log("文档加载完成，开始初始化");
    initialize();
  });

  // 添加更新倒计时的函数
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

  // 添加更新倒计时显示的函数
  function updateCountdownDisplay(text) {
    const countdownDisplay = document.getElementById("countdown-display");
    if (countdownDisplay) {
      countdownDisplay.textContent = text;
    }
  }
})();
