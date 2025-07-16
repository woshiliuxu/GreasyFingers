// ==UserScript==
// @name         网页模糊切换工具
// @namespace    http://tampermonkey.net/
// @version      1.1.1
// @license MIT
// @description  一键模糊/恢复整个网页，支持快捷键自定义、模糊程度调节、指示器可关闭
// @author       otis
// @icon    https://file.fishpi.cn/2025/07/logo-12ba9b4e.jpeg
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    // 默认设置
    const defaultSettings = {
        blurEnabled: false,
        blurAmount: 5,
        hotkey: 'Ctrl+B'
    };

    // 获取或初始化设置
    let settings = {
        blurEnabled: GM_getValue('blurEnabled', defaultSettings.blurEnabled),
        blurAmount: GM_getValue('blurAmount', defaultSettings.blurAmount),
        hotkey: GM_getValue('hotkey', defaultSettings.hotkey)
    };

    // 创建样式元素
    const styleElement = document.createElement('style');
    styleElement.id = 'global-blur-style';
    document.head.appendChild(styleElement);

    // 添加状态指示器（提前创建，避免未初始化访问）
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.bottom = '10px';
    indicator.style.right = '10px';
    indicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
    indicator.style.color = 'white';
    indicator.style.padding = '5px 10px';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '999999';
    indicator.style.fontFamily = 'Arial, sans-serif';
    indicator.style.fontSize = '12px';
    indicator.style.cursor = 'pointer';
    indicator.title = '点击关闭指示器';
    document.body.appendChild(indicator);

    // 更新指示器
    function updateIndicator() {
        indicator.textContent = `模糊效果: ${settings.blurEnabled ? '开启' : '关闭'} (${settings.blurAmount}px) 快捷键: ${settings.hotkey}`;
    }

    // 应用模糊效果
    function applyBlur() {
        if (settings.blurEnabled) {
            styleElement.textContent = `
                body {
                    filter: blur(${settings.blurAmount}px) !important;
                    -webkit-filter: blur(${settings.blurAmount}px) !important;
                    height: 100% !important;
                    overflow: hidden !important;
                }
            `;
        } else {
            styleElement.textContent = '';
        }
        updateIndicator();
    }

    // 切换模糊状态
    function toggleBlur() {
        settings.blurEnabled = !settings.blurEnabled;
        GM_setValue('blurEnabled', settings.blurEnabled);
        applyBlur();
    }

    // 设置模糊程度
    function setBlurAmount(amount) {
        settings.blurAmount = amount;
        GM_setValue('blurAmount', settings.blurAmount);
        if (settings.blurEnabled) {
            applyBlur();
        } else {
            updateIndicator();
        }
    }

    // 设置快捷键
    function setHotkey(hotkey) {
        settings.hotkey = hotkey;
        GM_setValue('hotkey', hotkey);
        updateIndicator();
    }

    // 解析快捷键字符串
    function matchHotkey(e, hotkeyStr) {
        const [mod, key] = hotkeyStr.split('+');
        return (
            ((mod.toLowerCase() === 'ctrl' && e.ctrlKey) ||
             (mod.toLowerCase() === 'alt' && e.altKey) ||
             (mod.toLowerCase() === 'shift' && e.shiftKey)) &&
            e.key.toLowerCase() === key.toLowerCase()
        );
    }

    // 指示器点击关闭
    indicator.addEventListener('click', () => {
        indicator.style.display = 'none';
    });

    // 初始化模糊状态
    applyBlur();

    // 添加快捷键监听
    document.addEventListener('keydown', function(e) {
        if (matchHotkey(e, settings.hotkey)) {
            e.preventDefault();
            toggleBlur();
        }
    });

    // 添加菜单命令
    GM_registerMenuCommand('切换模糊效果 (' + settings.hotkey + ')', toggleBlur);
    GM_registerMenuCommand('设置模糊程度', function() {
        const amount = prompt('请输入模糊程度 (1-20):', settings.blurAmount);
        if (amount !== null) {
            const num = parseInt(amount);
            if (!isNaN(num) && num >= 1 && num <= 20) {
                setBlurAmount(num);
            } else {
                alert('请输入1-20之间的数字');
            }
        }
    });
    GM_registerMenuCommand('设置快捷键', function() {
        const key = prompt('请输入快捷键（如 Ctrl+B、Alt+Q、Shift+Z）:', settings.hotkey);
        if (key && /^\s*(Ctrl|Alt|Shift)\s*\+\s*\w\s*$/i.test(key)) {
            setHotkey(key.replace(/\s+/g, ''));
        } else if (key) {
            alert('格式错误，请输入如 Ctrl+B、Alt+Q、Shift+Z');
        }
    });
    GM_registerMenuCommand('重置所有设置', function() {
        if (confirm('确定要重置所有设置吗？')) {
            settings = {...defaultSettings};
            GM_setValue('blurEnabled', settings.blurEnabled);
            GM_setValue('blurAmount', settings.blurAmount);
            GM_setValue('hotkey', settings.hotkey);
            applyBlur();
        }
    });

    // 初始更新指示器
    updateIndicator();
})();
