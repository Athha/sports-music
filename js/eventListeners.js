import { checkAllFiles, clearStorage } from './programUtils.js';
import { stopAllMusic } from './audioUtils.js';

export function setupEventListeners() {
    document.getElementById('check-all-files').addEventListener('click', checkAllFiles);
    document.getElementById('clear-storage').addEventListener('click', clearStorage);
    document.getElementById('stop-all-music').addEventListener('click', stopAllMusic);
}
