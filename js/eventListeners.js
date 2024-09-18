import { checkAllFiles, clearStorage } from '/sports-music/js/programUtils.js';
import { stopAllMusic } from '/sports-music/js/audioUtils.js';

export function setupEventListeners() {
    document.getElementById('check-all-files').addEventListener('click', checkAllFiles);
    document.getElementById('clear-storage').addEventListener('click', clearStorage);
    document.getElementById('stop-all-music').addEventListener('click', stopAllMusic);
}
