// ==UserScript==
// @name         国开刷课助手
// @namespace    http://tampermonkey.net/
// @version      2024-10-12
// @description  国开刷课辅助工具，支持自动完成课程
// @author       You
// @match        https://lms.ouchn.cn/course/*/learning-activity/full-screen
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ouchn.cn
// @grant        none
// @require      https://cdn.tailwindcss.com
// @require      https://raw.githubusercontent.com/sichang824/tampermonkey/main/guokai/course/config.js
// @require      https://raw.githubusercontent.com/sichang824/tampermonkey/main/guokai/course/state.js
// @require      https://raw.githubusercontent.com/sichang824/tampermonkey/main/guokai/course/helpers.js
// @require      https://raw.githubusercontent.com/sichang824/tampermonkey/main/guokai/course/ui.js
// @require      https://raw.githubusercontent.com/sichang824/tampermonkey/main/guokai/course/pageHandler.js
// ==/UserScript==

/**
 * 国开刷课助手
 * ---------------------
 * 功能:
 * 1. 自动处理各类型课程（视频、文档、文本等）
 * 2. 可调节播放速度和音量
 * 3. 深色/浅色模式支持
 * 4. 可拖拽面板
 * 5. 使用Tailwind CSS实现美观界面
 *
 * 使用方法:
 * 1. 安装Tampermonkey浏览器扩展
 * 2. 添加此脚本
 * 3. 访问国开大学课程页面
 * 4. 在页面右上角会出现控制面板
 * 5. 点击"自动处理"按钮开始刷课
 *
 * GitHub仓库: https://github.com/sichang824/tampermonkey
 */

(function () {
  "use strict";

  // 初始化Tailwind CSS
  function initTailwind() {
    // 使用Play CDN的style标签方式添加自定义样式
    const style = document.createElement("style");
    style.setAttribute("type", "text/tailwindcss");
    style.textContent = `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;

      #control-panel {
        position: fixed !important;
        top: 1rem !important;
        right: 1rem !important;
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(style);

    // 添加Tailwind的标识，帮助调试
    document.documentElement.classList.add("with-tailwind");
  }

  // 初始化函数
  function initialize() {
    window.HELPERS.log("开始初始化国开刷课助手...");

    // 加载配置
    window.CONFIG.loadConfig();

    // 初始化Tailwind
    initTailwind();

    // 设置初始状态
    window.STATE.changeState(window.STATE.State.IDLE);

    // 开始处理页面
    window.HANDLER.processPage();

    window.HELPERS.log("国开刷课助手初始化完成");
  }

  // 监听视频元素变化
  function setupVideoListener() {
    window.HELPERS.whenForKeyElements("video", (video) => {
      // 设置初始音量
      video.volume = window.configProxy.volume / 100;

      // 设置初始播放速度
      video.playbackRate = Number(window.configProxy.playbackSpeed);

      // 添加视频进度监听
      video.addEventListener("timeupdate", () => {
        // 计算视频进度百分比
        const progress = (video.currentTime / video.duration) * 100;

        // 更新进度显示
        const progressDisplay = document.getElementById("progress-display");
        if (progressDisplay) {
          progressDisplay.textContent = Math.round(progress);
        }

        // 当进度达到99.5%时自动点击下一页
        if (progress >= 99.5) {
          window.HELPERS.log("视频播放完成，准备跳转下一页");
          window.HANDLER.updateVideoInfo();
          window.HANDLER.fetchActivityRead();
          window.HANDLER.clickNextButton(3);
        }
      });

      // 添加视频错误处理
      video.addEventListener("error", (e) => {
        window.HELPERS.log("视频加载出错: " + e, "error");
        window.STATE.updateStatus("视频加载失败");
      });
    });
  }

  // 优化页面显示
  function optimizePage() {
    // 自动展开侧边栏
    const expandButton = document.querySelector(".sidebar-collapse-toggle");
    if (expandButton) {
      expandButton.click();
    }
  }

  // 当文档加载完成时初始化
  window.addEventListener("load", () => {
    window.HELPERS.log("文档加载完成，开始初始化国开刷课助手");
    initialize();
    setupVideoListener();
    optimizePage();

    // 确保在页面完全加载后创建面板
    setTimeout(() => {
      window.UI.createControlPanel();
    }, 500);

    // 添加版本信息到控制台
    console.log(
      "%c国开刷课助手 %cv2024.10.12",
      "color: #3b82f6; font-weight: bold; font-size: 14px;",
      "color: #10b981; font-weight: normal; font-size: 12px;"
    );
  });
})();
