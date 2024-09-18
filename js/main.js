import { initializeApp } from './app.js';
import { setupEventListeners } from './eventListeners.js';
import { initSortable } from './sortable.js';
import { displayVersion } from './version.js';
import { checkAudioFileStatus } from './audioUtils.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    initSortable();
    displayVersion();
    checkAudioFileStatus();
});
