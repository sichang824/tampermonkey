// 页面处理模块
window.HANDLER = {
  // 检测当前页面类型
  detectPageType: function () {
    const activeItem = document.querySelector(
      ".full-screen-mode-sidebar-menu-item.active"
    );
    if (!activeItem) {
      window.HELPERS.log("未找到活动项目，可能页面仍在加载", "warn");
      return "加载中";
    }

    const icon = activeItem.querySelector("i.activity-type-icon");
    if (!icon) {
      window.HELPERS.log("未找到图标，可能页面结构有变化", "warn");
      return "未知";
    }

    const iconClass = icon.className;
    if (iconClass.includes("font-syllabus-exam")) return "考试";
    if (iconClass.includes("font-syllabus-material")) return "文件";
    if (iconClass.includes("font-syllabus-page")) return "文本";
    if (iconClass.includes("font-syllabus-forum")) return "讨论";
    if (iconClass.includes("font-syllabus-web-link")) return "问卷";
    if (iconClass.includes("font-syllabus-online-video")) return "视频";

    window.HELPERS.log(`无法识别的图标类名: ${iconClass}`, "warn");
    return "未知";
  },

  // 检测并更新页面类型
  detectAndUpdatePageType: function () {
    const pageType = this.detectPageType();
    window.HELPERS.log(`当前页面类型: ${pageType}`);
    const pageTypeDisplay = document.getElementById("page-type-display");
    if (pageTypeDisplay) {
      pageTypeDisplay.textContent = pageType;
    }
    return pageType;
  },

  // 根据页面类型执行相应操作
  executeActionByPageType: async function () {
    if (window.configProxy.autoProcessEnabled === false) {
      window.HELPERS.log("自动处理已关闭，跳过执行", "warn");
      return;
    }

    const pageType = this.detectPageType();
    window.STATE.updateStatus(`处理${pageType}页面`);
    window.STATE.changeState(window.STATE.State.PROCESSING);

    // 重置状态显示
    const progressDisplay = document.getElementById("progress-display");
    const completenessDisplay = document.getElementById("completeness-display");
    if (progressDisplay) progressDisplay.textContent = "0%";
    if (completenessDisplay) completenessDisplay.textContent = "未知";

    window.HELPERS.log(`开始处理页面类型: ${pageType}`);

    switch (pageType) {
      case "文件":
        await this.handleFilePage();
        break;
      case "文本":
        await this.handleTextPage();
        break;
      case "讨论":
        await this.handleDiscussionPage();
        break;
      case "问卷":
        await this.handleSurveyPage();
        break;
      case "视频":
        await this.handleVideoPage();
        break;
      case "考试":
        await this.clickNextButton();
        break;
      default:
        window.HELPERS.log("未知页面类型,跳过到下一个页面", "warn");
        await this.clickNextButton();
    }
  },

  waitComplete: async function () {
    let retryCount = 0;
    const maxRetries = 3;
    let completeness = 0;
    const baseDelay = 5000; // 基础延迟时间5秒

    while (completeness <= 80) {
      try {
        completeness = await this.fetchActivityRead();
        window.HELPERS.log(`当前完成度: ${completeness}%`);

        if (completeness >= 80) {
          window.HELPERS.log("完成度达到要求，继续处理");
          return true;
        }

        // 计算递增的延迟时间：5s, 10s, 15s
        const delay = baseDelay * (retryCount + 1);
        window.HELPERS.log(`等待 ${delay / 1000} 秒后重试`);
        await window.HELPERS.sleep(delay);
      } catch (error) {
        window.HELPERS.log(`查询完成度失败: ${error.message}`, "warn");
        retryCount++;

        if (retryCount >= maxRetries) {
          window.HELPERS.log("达到最大重试次数，继续处理", "warn");
          return false;
        }

        // 计算递增的延迟时间：5s, 10s, 15s
        const delay = baseDelay * (retryCount + 1);
        window.HELPERS.log(
          `等待 ${delay / 1000} 秒后重试 (${retryCount}/${maxRetries})`
        );
        await window.HELPERS.sleep(delay);
      }
    }
    return false;
  },

  // 处理文件类型页面
  handleFilePage: async function () {
    await window.HELPERS.sleep(2000);
    window.STATE.updateStatus("处理文件页面");
    window.HELPERS.log("正在处理文件类型页面");
    const tbody = document.querySelector(".ivu-table-tbody");

    if (tbody) {
      const fileRows = tbody.querySelectorAll("tr");
      window.HELPERS.log(`找到 ${fileRows.length} 个文件`);

      for (let i = 0; i < fileRows.length; i++) {
        window.HELPERS.log(`处理第 ${i + 1} 个文件`);
        if (window.STATE.getCurrentState() !== window.STATE.State.PROCESSING) {
          window.HELPERS.log("处理被停止", "warn");
          window.STATE.changeState(window.STATE.State.IDLE);
          return;
        }

        const viewButton = fileRows[i].querySelector(
          ".ivu-table-row > td:first-child > div > a"
        );
        viewButton.click();
        window.HELPERS.log("点击查看按钮");
        if (await this.waitComplete()) {
          await this.closeFile();
        } else {
          this.stopProcessing();
          window.HELPERS.log("等待完成时出错", "error");
        }

        // 添加随机延迟，避免操作过快
        await window.HELPERS.randomDelay(
          window.configProxy.minDelay,
          window.configProxy.maxDelay
        );
      }

      window.HELPERS.log("所有文件已处理完毕");
      if (window.STATE.getCurrentState() === window.STATE.State.PROCESSING) {
        await this.clickNextButton();
      }
    } else {
      window.HELPERS.log("未找到文件列表", "warn");
      await this.clickNextButton();
    }
  },

  // 关闭文件预览
  closeFile: async function () {
    window.HELPERS.log("尝试关闭文件");
    await window.HELPERS.sleep(3000);
    const closeButton = document.querySelector(
      "#file-previewer > div > div > div.header.clearfix > a"
    );
    closeButton.click();
  },

  // 处理文本类型页面
  handleTextPage: async function () {
    window.STATE.updateStatus("处理文本页面");
    window.HELPERS.log("处理文本类型页面");
    window.scrollTo(0, document.body.scrollHeight);
    await this.clickNextButton();
  },

  // 处理讨论类型页面
  handleDiscussionPage: async function () {
    window.STATE.updateStatus("处理讨论页面");
    window.HELPERS.log("处理讨论类型页面");
    await this.clickNextButton();
  },

  // 处理问卷类型页面
  handleSurveyPage: async function () {
    window.STATE.updateStatus("处理问卷页面");
    window.HELPERS.log("处理问卷类型页面");
    await this.clickNextButton();
  },

  // 处理视频类型页面
  handleVideoPage: async function () {
    window.STATE.updateStatus("处理视频页面");
    window.HELPERS.log("处理视频类型页面");

    return new Promise((resolve) => {
      window.HELPERS.whenForKeyElements(
        ".mvp-fonts.mvp-fonts-play",
        async (element) => {
          window.HELPERS.log("检查到播放器");

          // 更新视频信息
          const updateSuccess = await this.updateVideoInfo();

          if (updateSuccess) {
            // 等待完成度达标
            const isComplete = await this.waitComplete();
            if (isComplete) {
              window.HELPERS.log("视频处理完成，准备进入下一页");
              await this.clickNextButton();
              resolve();
            } else {
              window.HELPERS.log("视频完成度未达标，等待后重试", "warn");
              await window.HELPERS.sleep(5000);
              this.handleVideoPage();
            }
          } else {
            window.HELPERS.log("视频信息更新失败，等待后重试", "warn");
            await window.HELPERS.sleep(5000);
            this.handleVideoPage();
          }
        }
      );
    });
  },

  // 等待页面内容更新
  waitForPageUpdate: function () {
    return new Promise((resolve) => {
      // 监听内容区域的变化
      const contentArea = document.querySelector(".full-screen-mode-content");
      if (!contentArea) {
        window.HELPERS.log("未找到内容区域，直接继续", "warn");
        resolve();
        return;
      }

      const observer = new MutationObserver((mutations) => {
        // 检查是否有内容更新
        for (const mutation of mutations) {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            observer.disconnect();
            resolve();
            return;
          }
        }
      });

      // 开始观察内容区域的变化
      observer.observe(contentArea, {
        childList: true,
        subtree: true,
      });

      // 设置超时，防止页面长时间不更新
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 10000);
    });
  },

  // 点击下一个按钮
  clickNextButton: async function (wait = 10) {
    clearInterval(window.STATE.checkInterval);

    const nextButton = document.querySelector(
      "button.next-btn.ivu-btn.ivu-btn-default"
    );
    window.HELPERS.log(`找到下一个按钮: ${nextButton ? "是" : "否"}`);

    if (nextButton) {
      window.STATE.startProcessCountdown(wait, async () => {
        window.HELPERS.log("点击下一个页面");
        nextButton.click();

        // 等待页面内容更新
        await this.waitForPageUpdate();

        // 等待一小段时间确保内容完全加载
        await window.HELPERS.sleep(1000);

        // 页面更新后执行处理
        this.processPage();
      });
    }
  },

  // 获取活动阅读数据
  fetchActivityRead: async function () {
    const activityId = window.HELPERS.getCurrentActivityId();
    if (!activityId) {
      window.HELPERS.log("无法获取ActivityId", "error");
      return 0;
    }

    window.HELPERS.log(`开始获取活动阅读数据, ActivityId: ${activityId}`);
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
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }

      const data = await response.json();
      window.HELPERS.log(`解析的数据: ${JSON.stringify(data)}`);

      if (data.completeness === "full") {
        const completeness = data.data?.completeness || 0;
        window.HELPERS.log(`完成度: ${completeness}`);
        window.UI.updateCompletenessDisplay(completeness);
        return completeness;
      } else if (data.completeness === "part") {
        window.HELPERS.log("未完成");
        window.UI.updateCompletenessDisplay("未完成");
        return 0;
      } else {
        window.HELPERS.log("未知的完成度状态", "warn");
        window.UI.updateCompletenessDisplay("未知");
        return 0;
      }
    } catch (error) {
      window.HELPERS.log(`获取数据失败: ${error.message}`, "error");
      window.UI.updateCompletenessDisplay("获取失败");
      return 0;
    }
  },

  // 更新视频信息
  updateVideoInfo: async function () {
    const video = document.querySelector("video");
    if (!video) {
      window.HELPERS.log("未找到视频元素", "warn");
      return false;
    }

    const end = Math.round(video.duration) - 10;
    const activityId = window.HELPERS.getCurrentActivityId();
    let retryCount = 0;
    const maxRetries = 3;

    window.HELPERS.log(`更新视频信息，时长: ${end}秒`);

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(
          `https://lms.ouchn.cn/api/course/activities-read/${activityId}`,
          {
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
            body: JSON.stringify({ start: 0, end: end }),
            method: "POST",
            mode: "cors",
            credentials: "include",
          }
        );

        if (response.ok) {
          window.HELPERS.log("视频信息更新成功");
          return true;
        } else {
          retryCount++;
          window.HELPERS.log(
            `视频信息更新失败: ${response.status} (${retryCount}/${maxRetries})`,
            "warn"
          );
          if (retryCount < maxRetries) {
            await window.HELPERS.sleep(5000);
            continue;
          }
        }
      } catch (error) {
        retryCount++;
        window.HELPERS.log(
          `视频信息更新出错: ${error.message} (${retryCount}/${maxRetries})`,
          "error"
        );
        if (retryCount < maxRetries) {
          await window.HELPERS.sleep(5000);
          continue;
        }
      }
    }

    window.HELPERS.log("达到最大重试次数，继续处理", "warn");
    return false;
  },

  // 处理页面
  processPage: function () {
    window.HELPERS.log(
      `是否自动处理: ${window.configProxy.autoProcessEnabled}`
    );

    window.HELPERS.whenForKeyElements(
      ".full-screen-mode-sidebar-menu-item.active",
      (element) => {
        window.HELPERS.log("检测到活动项目");
        this.detectAndUpdatePageType(); // 初始检测页面类型
        if (window.configProxy.autoProcessEnabled) {
          this.executeActionByPageType();
        } else if (window.configProxy.autoStart) {
          // 如果设置了自动开始，则自动开启自动处理
          window.configProxy.autoProcessEnabled = true;
          window.UI.updateAutoProcessStatus();
          this.executeActionByPageType();
        }
      }
    );
  },

  // 停止处理
  stopProcessing: function () {
    window.STATE.updateStatus("自动处理已停止");
    window.HELPERS.log("停止自动处理");
    window.STATE.changeState(window.STATE.State.STOPPED);
    window.configProxy.autoProcessEnabled = false;
    const autoProcessCheckbox = document.getElementById("auto-process");
    if (autoProcessCheckbox) autoProcessCheckbox.checked = false;

    // 停止所有正在进行的操作
    clearTimeout(window.nextActionTimeout);
    clearTimeout(window.checkCompletenessTimeout);
    window.STATE.clearCountdowns();

    // 更新UI以反映停止状态
    window.UI.updateAutoProcessStatus();
  },
};
