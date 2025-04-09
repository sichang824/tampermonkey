// ==UserScript==
// @name         考试跳转和分数获取
// @namespace    http://tampermonkey.net/
// @version      2024-10-14
// @description  从当前 URL 获取课程 ID，生成考试链接，并获取考试分数
// @author       You
// @match        https://lms.ouchn.cn/course/*/ng
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ouchn.cn
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  function getCourseIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    const courseIndex = pathParts.indexOf('course');
    if (courseIndex !== -1 && courseIndex + 1 < pathParts.length) {
      return pathParts[courseIndex + 1];
    }
    return null;
  }

  function addExamElements(element) {
    const examId = element.parentNode.parentNode.parentNode.id.split('-')[2];
    const courseId = getCourseIdFromUrl();
    if (!courseId) {
      console.error('无法从 URL 获取课程 ID');
      return;
    }
    const examUrl1 = `https://lms.ouchn.cn/exam/${examId}/subjects#/take`;
    const examUrl2 = `https://lms.ouchn.cn/course/${courseId}/learning-activity#/exam/${examId}`;
    const button1 = createExamButton('考题页面', examUrl1);
    const button2 = createExamButton('考试详情', examUrl2);
    const scoreButton = createScoreButton('获取分数', examId);
    element.parentNode.insertBefore(button1, element.nextSibling);
    element.parentNode.insertBefore(button2, button1.nextSibling);
    element.parentNode.insertBefore(scoreButton, button2.nextSibling);
  }

  function createExamButton(text, url) {
    const button = document.createElement('a');
    button.textContent = text;
    button.href = url;
    button.className = 'exam-link-button';
    button.style.cssText =
      'display: inline-block; margin: 5px; padding: 5px 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;';
    button.target = '_blank';

    button.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    return button;
  }

  function createScoreButton(text, examId) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'exam-score-button';
    button.style.cssText =
      'display: inline-block; margin: 5px; padding: 5px 10px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;';

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      fetchExamScore(button, examId);
    });

    return button;
  }

  function fetchExamScore(button, examId) {
    fetch('https://lms.ouchn.cn/api/exams/' + examId + '/submissions', {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="129", "Not=A?Brand";v="8"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
      referrer: 'https://lms.ouchn.cn/course/40000073315/learning-activity/full-screen',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => (button.textContent = data.exam_score));
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
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          shouldCheck = true;
          break;
        }
      }

      if (shouldCheck) {
        checkForElements();
      }
    });

    observer.observe(targetNode, config);

    // 返回一个函数，用于停止观察
    return () => observer.disconnect();
  }

  const selector = "[id^='learning-activity-'] > div > div > div.activity-header";

  whenForKeyElements(selector, element => {
    console.log('检测到文件内容', element);
    const examElements = document.querySelectorAll(selector);
    examElements.forEach(addExamElements);
  });
})();
