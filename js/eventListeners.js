import { checkAllFiles, clearStorage } from './programUtils.js';
import { stopAllMusic } from './audioUtils.js';
import { exportProgramData, importProgramData } from './exportImport.js';

export function setupEventListeners() {
    document.getElementById('check-all-files').addEventListener('click', checkAllFiles);
    document.getElementById('clear-storage').addEventListener('click', clearStorage);
    document.getElementById('stop-all-music').addEventListener('click', stopAllMusic);
    document.getElementById('export-data').addEventListener('click', exportProgramData);
    document.getElementById('import-button').addEventListener('click', () => {
        document.getElementById('import-data').click();
    });
    document.getElementById('import-data').addEventListener('change', importProgramData);
}
