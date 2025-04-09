// UI控制面板模块
window.UI = {
  // 创建控制面板
  createControlPanel: function() {
    const panel = document.createElement("div");
    panel.id = "control-panel";
    panel.className = "control-panel";
    
    // 添加深色/浅色模式的类
    panel.classList.add(window.configProxy.isDarkMode ? 'dark' : 'light');
    
    const panelContent = `
      <div id="panel-body" class="p-3">
        <h3 id="panel-title" class="control-panel-title cursor-move">国开刷课助手</h3>
        <div class="control-panel-section">
          <div class="control-panel-label">类型: <span id="page-type-display" class="font-medium">未知</span></div>
          <div class="control-panel-label">状态: <span id="current-status" class="font-medium">${window.STATE.getCurrentStatus()}</span></div>
          <div class="control-panel-label">进度: <span id="progress-display" class="font-medium">0</span>%</div>
        </div>
        
        <div class="control-panel-section">
          <div class="flex items-center justify-between">
            <label class="control-panel-label">音量:</label>
            <div class="flex items-center">
              <input type="range" id="volume-slider" min="0" max="100" value="${
                window.configProxy.volume
              }" class="gk-range w-24">
              <span id="volume-display" class="ml-2 text-sm">${window.configProxy.volume}</span>
            </div>
          </div>
          <div class="flex items-center justify-between mt-2">
            <label class="control-panel-label">速度:</label>
            <div class="flex items-center">
              <input type="range" id="speed-slider" min="1" max="16" value="${
                window.configProxy.playbackSpeed
              }" class="gk-range w-24">
              <span id="speed-display" class="ml-2 text-sm">${window.configProxy.playbackSpeed}x</span>
            </div>
          </div>
        </div>
        
        <div class="control-panel-section">
          <div class="control-panel-label">完成度: <span id="completeness-display" class="font-medium">未知</span></div>
          <div class="control-panel-label">自动: <span id="auto-process-status" class="font-medium">${
            window.configProxy.autoProcessEnabled ? "开启" : "关闭"
          }</span></div>
          <div class="control-panel-label">倒计时: <span id="countdown-display" class="font-medium">-</span></div>
        </div>
        
        <div class="grid grid-cols-2 gap-2 mb-3">
          ${this.createButton("fetch-completeness", "完成度")}
          ${this.createButton("next-btn", "下一个")}
          ${this.createButton("auto-process-btn", "自动")}
          ${this.createButton("complete-video", "完成")}
          ${this.createButton("stop-btn", "停止", "bg-danger hover:bg-danger/80")}
        </div>
        
        <div class="space-y-2">
          ${this.createCheckbox("auto-process", "自动处理", window.configProxy.autoProcessEnabled)}
          ${this.createCheckbox("dark-mode", "黑暗模式", window.configProxy.isDarkMode)}
        </div>
      </div>
    `;

    panel.innerHTML = panelContent;
    document.body.appendChild(panel);

    // 初始化面板状态
    if (window.configProxy.isPanelHidden) {
      const panelBody = document.getElementById('panel-body');
      if (panelBody) {
        panelBody.classList.add('hidden');
      }
    }

    this.addEventListeners(panel);
  },

  // 使用Tailwind创建按钮
  createButton: function(id, text, customClass = "") {
    return `<button id="${id}" class="control-panel-button ${customClass}">${text}</button>`;
  },

  // 使用Tailwind创建复选框
  createCheckbox: function(id, label, checked) {
    return `
      <div class="flex items-center">
        <input type="checkbox" id="${id}" ${checked ? "checked" : ""} class="control-panel-input mr-2">
        <label for="${id}" class="control-panel-label cursor-pointer">${label}</label>
      </div>
    `;
  },

  // 更新面板主题（明/暗模式）
  updatePanelTheme: function(panel, isDarkMode) {
    panel.classList.toggle('dark', isDarkMode);
    panel.classList.toggle('light', !isDarkMode);
  },

  // 添加事件监听器
  addEventListeners: function(panel) {
    const self = this;
    
    const eventMap = {
      "panel-title": {
        event: "mousedown",
        handler: (e) => this.makeDraggable(panel, e.target),
      },
      "fetch-completeness": { event: "click", handler: window.HANDLER.fetchActivityRead },
      "next-btn": { event: "click", handler: window.HANDLER.clickNextButton },
      "auto-process": {
        event: "change",
        handler: (e) => {
          window.configProxy.autoProcessEnabled = e.target.checked;
          self.updateAutoProcessStatus();
          if (window.configProxy.autoProcessEnabled) {
            window.HANDLER.executeActionByPageType();
          }
        },
      },
      "dark-mode": {
        event: "change",
        handler: (e) => {
          window.configProxy.isDarkMode = e.target.checked;
          self.updatePanelTheme(panel, e.target.checked);
        },
      },
      "auto-process-btn": {
        event: "click",
        handler: () => {
          window.STATE.updateStatus(`手动触发自动处理`);
          window.HANDLER.executeActionByPageType();
        },
      },
      "stop-btn": { event: "click", handler: window.HANDLER.stopProcessing },
      "complete-video": {
        event: "click",
        handler: this.completeVideo,
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
      volumeSlider.value = window.configProxy.volume;
      volumeDisplay.textContent = window.configProxy.volume;

      volumeSlider.addEventListener("input", (e) => {
        const volume = e.target.value;
        volumeDisplay.textContent = volume;
        window.configProxy.volume = volume; // 保存到配置
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
      speedSlider.value = window.configProxy.playbackSpeed;
      speedDisplay.textContent = window.configProxy.playbackSpeed;

      speedSlider.addEventListener("input", (e) => {
        const speed = Math.min(16, Math.max(1, Number(e.target.value)));
        speedDisplay.textContent = speed;
        window.configProxy.playbackSpeed = speed; // 保存到配置
        const video = document.querySelector("video");
        if (video) {
          try {
            video.playbackRate = speed;
          } catch (error) {
            console.error("设置播放速度失败:", error);
            window.STATE.updateStatus("设置播放速度失败");
          }
        }
      });
    }
  },

  // 完成视频播放
  completeVideo: function() {
    const video = document.querySelector("video");
    if (video) {
      try {
        video.volume = window.configProxy.volume / 100;
        video.playbackRate = Math.min(
          16,
          Math.max(1, Number(window.configProxy.playbackSpeed))
        );

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("视频开始播放");
              window.STATE.updateStatus("视频正在播放");
            })
            .catch((error) => {
              console.warn("播放失败，尝试替代方法:", error);
              setTimeout(() => {
                try {
                  video.play();
                } catch (e) {
                  console.error("视频播放失败:", e);
                  window.STATE.updateStatus("视频播放失败");
                }
              }, 1000);
            });
        }

        window.STATE.updateStatus("正在完成视频播放");
      } catch (error) {
        console.error("设置视频参数失败:", error);
        window.STATE.updateStatus("设置视频参数失败");
      }
    } else {
      window.STATE.updateStatus("未找到视频元素");
    }
  },

  // 更新自动处理状态显示
  updateAutoProcessStatus: function() {
    const autoProcessStatus = document.getElementById("auto-process-status");
    if (autoProcessStatus) {
      autoProcessStatus.textContent = window.configProxy.autoProcessEnabled
        ? "开启"
        : "关闭";
    }
  },

  // 更新完成度显示
  updateCompletenessDisplay: function(completeness) {
    const completenessDisplay = document.getElementById("completeness-display");
    if (completenessDisplay) {
      completenessDisplay.textContent = `${completeness}%`;
    }
  },

  // 使控制面板可拖动
  makeDraggable: function(element, handle) {
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
    
    return function cleanup() {
      handle.removeEventListener("mousedown", startDragging);
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stopDragging);
    };
  }
};
