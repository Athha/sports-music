import { initializeApp } from '/sports-music/js/app.js';
import { setupEventListeners } from '/sports-music/js/eventListeners.js';
import { initSortable } from '/sports-music/js/sortable.js';
import { displayVersion } from '/sports-music/js/version.js';
import { checkAudioFileStatus } from '/sports-music/js/audioUtils.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    initSortable();
    displayVersion();
    checkAudioFileStatus();
});

console.log('main.js is loaded');
