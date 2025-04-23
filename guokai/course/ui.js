// UI控制面板模块
window.UI = {
  // 创建控制面板
  createControlPanel: function () {
    const panel = document.createElement("div");
    panel.id = "control-panel";
    panel.className = "bg-white/95 dark:bg-gray-800/95 shadow-xl rounded-xl p-6 w-[320px] border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm overflow-y-auto max-h-[calc(100vh-2rem)]";

    // 添加深色/浅色模式的类
    panel.classList.add(window.configProxy.isDarkMode ? "dark" : "light");

    // 确保面板在文档中
    if (!document.body.contains(panel)) {
      document.body.appendChild(panel);
    }

    const panelContent = `
      <div class="flex items-center justify-between mb-6">
        <h3 id="panel-title" class="text-xl font-bold text-gray-800 dark:text-white cursor-move flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          国开刷课助手
        </h3>
        <div class="flex items-center gap-2">
          <label class="flex items-center space-x-2 cursor-pointer">
            <div class="relative">
              <input type="checkbox" id="dark-mode" ${window.configProxy.isDarkMode ? "checked" : ""} 
                class="sr-only peer">
              <div class="w-9 h-5 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
            </div>
          </label>
          <button id="hide-panel" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" title="隐藏/显示面板">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          </button>
        </div>
      </div>
      <div id="panel-body">
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <div class="text-xs text-gray-500 dark:text-gray-400">类型</div>
              <div id="page-type-display" class="font-medium text-gray-800 dark:text-white">未知</div>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-gray-500 dark:text-gray-400">状态</div>
              <div id="current-status" class="font-medium text-gray-800 dark:text-white">${window.STATE.getCurrentStatus()}</div>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-gray-500 dark:text-gray-400">进度</div>
              <div id="progress-display" class="font-medium text-gray-800 dark:text-white">0%</div>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-gray-500 dark:text-gray-400">完成度</div>
              <div id="completeness-display" class="font-medium text-gray-800 dark:text-white">未知</div>
            </div>
          </div>
        </div>
        
        <div class="space-y-4 mb-6">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">音量</label>
              <span id="volume-display" class="text-sm text-gray-500 dark:text-gray-400">${
                window.configProxy.volume
              }</span>
            </div>
            <input type="range" id="volume-slider" min="0" max="100" value="${
              window.configProxy.volume
            }" 
              class="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:hover:bg-blue-600">
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">速度</label>
              <span id="speed-display" class="text-sm text-gray-500 dark:text-gray-400">${
                window.configProxy.playbackSpeed
              }x</span>
            </div>
            <input type="range" id="speed-slider" min="1" max="16" value="${
              window.configProxy.playbackSpeed
            }" 
              class="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:hover:bg-blue-600">
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-3 mb-6">
          ${this.createButton(
            "fetch-completeness",
            "完成度",
            "bg-blue-500 hover:bg-blue-600"
          )}
          ${this.createButton(
            "next-btn",
            "下一个",
            "bg-blue-500 hover:bg-blue-600"
          )}
          ${this.createButton(
            "auto-process-btn",
            `<span class="flex items-center gap-2">
              <span>自动</span>
              <span id="countdown-display" class="text-xs">-</span>
            </span>`,
            `bg-green-500 hover:bg-green-600 ${window.configProxy.autoProcessEnabled ? 'ring-2 ring-offset-2 ring-green-500' : ''}`
          )}
          ${this.createButton(
            "complete-video",
            "处理视频",
            "bg-green-500 hover:bg-green-600"
          )}
          ${this.createButton(
            "stop-btn",
            "停止",
            "bg-red-500 hover:bg-red-600"
          )}
        </div>
      </div>
    `;

    panel.innerHTML = panelContent;

    // 初始化面板状态
    if (window.configProxy.isPanelHidden) {
      const panelBody = document.getElementById("panel-body");
      if (panelBody) {
        panelBody.classList.add("hidden");
      }
    }

    this.addEventListeners(panel);
  },

  // 使用Tailwind创建按钮
  createButton: function (id, text, customClass = "") {
    return `<button id="${id}" class="w-full px-4 py-2 text-white rounded-lg transition-all duration-200 hover:shadow-md active:scale-[0.98] ${customClass}">${text}</button>`;
  },

  // 使用Tailwind创建复选框
  createCheckbox: function (id, label, checked) {
    return `
      <label class="flex items-center space-x-3 cursor-pointer">
        <div class="relative">
          <input type="checkbox" id="${id}" ${checked ? "checked" : ""} 
            class="sr-only peer">
          <div class="w-9 h-5 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
        </div>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${label}</span>
      </label>
    `;
  },

  // 更新面板主题（明/暗模式）
  updatePanelTheme: function (panel, isDarkMode) {
    panel.classList.toggle("dark", isDarkMode);
    panel.classList.toggle("light", !isDarkMode);
  },

  // 添加事件监听器
  addEventListeners: function (panel) {
    const self = this;

    const eventMap = {
      "panel-title": {
        event: "mousedown",
        handler: (e) => this.makeDraggable(panel, e.target),
      },
      "hide-panel": {
        event: "click",
        handler: () => {
          const panelBody = document.getElementById("panel-body");
          if (panelBody) {
            panelBody.classList.toggle("hidden");
            const hideButton = document.getElementById("hide-panel");
            if (hideButton) {
              hideButton.innerHTML = panelBody.classList.contains("hidden")
                ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>';
            }
            window.configProxy.isPanelHidden =
              panelBody.classList.contains("hidden");
          }
        },
      },
      "fetch-completeness": {
        event: "click",
        handler: async () => {
          try {
            const completeness = await window.HANDLER.fetchActivityRead();
            window.UI.updateCompletenessDisplay(completeness);
          } catch (error) {
            window.HELPERS.log(`查询完成度失败: ${error.message}`, "error");
          }
        },
      },
      "next-btn": { event: "click", handler: window.HANDLER.clickNextButton },
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
          window.configProxy.autoProcessEnabled = !window.configProxy.autoProcessEnabled;
          const autoBtn = document.getElementById("auto-process-btn");
          if (autoBtn) {
            autoBtn.classList.toggle("ring-2", window.configProxy.autoProcessEnabled);
            autoBtn.classList.toggle("ring-offset-2", window.configProxy.autoProcessEnabled);
            autoBtn.classList.toggle("ring-green-500", window.configProxy.autoProcessEnabled);
          }
          if (window.configProxy.autoProcessEnabled) {
            // 重置状态显示
            const progressDisplay = document.getElementById("progress-display");
            const completenessDisplay = document.getElementById("completeness-display");
            if (progressDisplay) progressDisplay.textContent = "0%";
            if (completenessDisplay) completenessDisplay.textContent = "未知";
            
            window.STATE.updateStatus(`手动触发自动处理`);
            window.HANDLER.executeActionByPageType();
          } else {
            window.HANDLER.stopProcessing();
          }
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

    // 添加倒计时更新
    setInterval(() => {
      this.updateCountdownDisplay();
    }, 1000);

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
  completeVideo: function () {
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
  updateAutoProcessStatus: function () {
    const autoProcessStatus = document.getElementById("auto-process-status");
    if (autoProcessStatus) {
      autoProcessStatus.textContent = window.configProxy.autoProcessEnabled
        ? "开启"
        : "关闭";
    }
  },

  // 更新完成度显示
  updateCompletenessDisplay: function (completeness) {
    const completenessDisplay = document.getElementById("completeness-display");
    if (completenessDisplay) {
      completenessDisplay.textContent = `${completeness}%`;
    }
  },

  // 使控制面板可拖动
  makeDraggable: function (element, handle) {
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
  },

  // 更新倒计时显示
  updateCountdownDisplay: function() {
    const countdownDisplay = document.getElementById("countdown-display");
    if (countdownDisplay) {
      const countdown = window.STATE.processCountdown ? window.STATE.getCurrentCountdown() : "-";
      countdownDisplay.textContent = countdown;
    }
  },
};
