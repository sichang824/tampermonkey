// ==UserScript==
// @name         国开刷课
// @namespace    http://tampermonkey.net/
// @version      2024-10-12
// @description  国开刷课辅助工具
// @author       You
// @match        https://lms.ouchn.cn/course/*/learning-activity/full-screen
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ouchn.cn
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4
// @require      https://cdn.jsdelivr.net/gh/yourusername/guokai/config.js
// @require      https://cdn.jsdelivr.net/gh/yourusername/guokai/helpers.js
// @require      https://cdn.jsdelivr.net/gh/yourusername/guokai/state.js
// @require      https://cdn.jsdelivr.net/gh/yourusername/guokai/ui.js
// @require      https://cdn.jsdelivr.net/gh/yourusername/guokai/pageHandler.js
// ==/UserScript==

(function () {
  'use strict';
  
  // 初始化Tailwind CSS
  function initTailwind() {
    // 使用Play CDN的style标签方式添加自定义样式
    const style = document.createElement('style');
    style.setAttribute('type', 'text/tailwindcss');
    style.textContent = `
      /* 自定义主题色 */
      @theme {
        --color-primary: #3b82f6;
        --color-primary-hover: #2563eb;
        --color-secondary: #6b7280;
        --color-success: #10b981;
        --color-danger: #ef4444;
        --color-warning: #f59e0b;
      }
      
      /* 确保面板样式不受页面影响 */
      #control-panel * {
        box-sizing: border-box;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
      
      /* 确保不同站点的样式不会覆盖我们的样式 */
      #control-panel {
        font-size: 14px;
        line-height: 1.5;
      }
      
      /* 自定义工具类 */
      .gk-btn {
        @apply px-2 py-1 rounded text-sm bg-primary text-white hover:bg-primary-hover transition-colors;
      }
      
      /* 滑块样式 */
      #control-panel input[type="range"] {
        @apply w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer;
      }
      
      #control-panel input[type="range"]::-webkit-slider-thumb {
        @apply appearance-none w-4 h-4 rounded-full bg-primary;
      }
    `;
    document.head.appendChild(style);
  }
  
  // 初始化函数
  function initialize() {
    // 加载配置
    window.loadConfig();
    
    // 初始化Tailwind
    initTailwind();
    
    // 创建控制面板
    window.createControlPanel();
    
    // 设置初始状态
    window.changeState(window.State.IDLE);
    
    // 开始处理页面
    window.processPage();
    
    console.log("国开刷课助手初始化完成");
  }

  // 监听视频元素变化
  function setupVideoListener() {
    window.whenForKeyElements("video", (video) => {
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
          console.log("视频播放完成,准备跳转下一页");
          window.updateVideoInfo();
          window.fetchActivityRead();
          window.clickNextButton(3);
        }
      });
      
      // 添加视频错误处理
      video.addEventListener("error", (e) => {
        console.error("视频加载出错:", e);
        window.updateStatus("视频加载失败");
      });
    });
  }
  
  // 当文档加载完成时初始化
  window.addEventListener("load", () => {
    console.log("文档加载完成，开始初始化国开刷课助手");
    initialize();
    setupVideoListener();
  });
  
})(); 