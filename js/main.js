import { initializeApp } from '/js/app.js';
import { setupEventListeners } from '/js/eventListeners.js';
import { initSortable } from '/js/sortable.js';
import { displayVersion } from '/js/version.js';
import { checkAudioFileStatus } from '/js/audioUtils.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    initSortable();
    displayVersion();
    checkAudioFileStatus();
});

// デバッグ用のコンソールログを追加
console.log('main.js is loaded');
