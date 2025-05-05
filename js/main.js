import { initializeApp, updateProgramData, exportProgramData, importProgramData } from '/sports-music/js/app.js';
import { setupEventListeners } from '/sports-music/js/eventListeners.js';
import { initSortable } from '/sports-music/js/sortable.js';
import { displayVersion } from '/sports-music/js/version.js';
import { checkAudioFileStatus } from '/sports-music/js/audioUtils.js';

console.log('main.js is executing');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    try {
        console.log('Initializing app');
        initializeApp();
        console.log('Setting up event listeners');
        setupEventListeners();
        console.log('Initializing sortable');
        initSortable();
        console.log('Displaying version');
        displayVersion();
        console.log('Checking audio file status');
        checkAudioFileStatus();
        console.log('All initialization steps completed');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error caught:', message, 'Source:', source, 'Line:', lineno, 'Column:', colno, 'Error object:', error);
};

// エクスポートボタンのイベントハンドラ
document.getElementById('export-data').addEventListener('click', () => {
    exportProgramData();
});

// インポートボタンのイベントハンドラ
document.getElementById('import-button').addEventListener('click', () => {
    document.getElementById('import-data').click();
});

document.getElementById('import-data').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        importProgramData(file);
    }
    // ファイル選択をリセット
    event.target.value = '';
});

console.log('main.js execution completed');
