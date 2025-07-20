// ==UserScript==
// @name         摸鱼派写字
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  点击生成按钮生成字，自动提交。
// @author       马达
// @icon         https://fishpi.cn/images/favicon.png
// @match        https://fishpi.cn/activity/character
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function getPageElements() {
    return {
      charElement: document.querySelector(".fn-inline a"),
      canvas: document.getElementById("charCanvas"),
      clearBtn: document.querySelector('button.red[onclick*="clearCharacter"]'),
    };
  }

  // 只插入生成按钮
  function insertGenBtn() {
    const oldPanel = document.getElementById("autoGenCharPanel");
    if (oldPanel) oldPanel.remove();
    const fnRight = document.querySelector(".fn-right");
    if (!fnRight) return;
    const panel = document.createElement("div");
    panel.id = "autoGenCharPanel";
    panel.style.display = "inline-block";
    panel.style.verticalAlign = "middle";
    panel.style.marginRight = "8px";
    panel.innerHTML = `
        <button id="autoGenCharBtn" class="" style="margin-left:6px;">生成</button>
      `;
    const firstBtn = fnRight.querySelector("button");
    if (firstBtn) {
      fnRight.insertBefore(panel, firstBtn);
    } else {
      fnRight.appendChild(panel);
    }
    document.getElementById("autoGenCharBtn").onclick = function () {
      autoWriteAndSubmit();
    };
  }

  // 自动写字并提交
  async function autoWriteAndSubmit() {
    const { charElement, canvas } = getPageElements();
    if (!charElement || !charElement.textContent.trim()) return;
    if (!canvas || canvas.width === 0) return;
    const targetChar = charElement.textContent.trim();
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    await drawAnyChar(ctx, canvasWidth, canvasHeight, targetChar);
    setTimeout(() => {
      try {
        if (typeof Activity !== "undefined" && Activity.submitCharacter) {
          Activity.submitCharacter("charCanvas");
        }
      } catch (error) {}
    }, 500);
  }

  // 通用写字函数
  function drawAnyChar(ctx, width, height, char) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";
    ctx.font = `${Math.floor(height * 0.8)}px sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.fillText(char, width / 2, height / 2);
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 6;
      const offsetY = (Math.random() - 0.5) * 6;
      ctx.globalAlpha = 0.5;
      ctx.strokeText(char, width / 2 + offsetX, height / 2 + offsetY);
    }
    ctx.globalAlpha = 1;
    ctx.strokeText(char, width / 2, height / 2);
    ctx.restore();
  }

  // 初始化
  function init() {
    const checkInterval = setInterval(() => {
      const { clearBtn, canvas } = getPageElements();
      if (clearBtn && canvas && canvas.width > 0) {
        clearInterval(checkInterval);
        insertGenBtn();
      }
    }, 500);
  }

  init();
})();
