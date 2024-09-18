import { loadFromLocalStorage, saveToLocalStorage } from '/sports-music/js/storage.js';
import { renderProgramTable } from '/sports-music/js/render.js';

console.log('app.js is executing');

export let programData = [];

export function initializeApp() {
    console.log('Initializing app');
    loadFromLocalStorage();
    console.log('Local storage loaded, programData:', programData);
    if (programData.length === 0) {
        console.log('No data in local storage, initializing with default data');
        // 初期データの設定
        programData = [
            { order: "", program: "開会式", audioFile: null, memo: "", isSection: true },
            { order: "", program: "入場", audioFile: null, memo: "", isSection: false },
            { order: "", program: "はじめのことば", audioFile: null, memo: "", isSection: false },
            { order: "", program: "君が代の歌", audioFile: null, memo: "", isSection: false },
            { order: "", program: "演技", audioFile: null, memo: "", isSection: true },
            { order: "", program: "力を合わせて", audioFile: null, memo: "", isSection: false },
            { order: "", program: "閉会式", audioFile: null, memo: "", isSection: true },
            { order: "", program: "入場", audioFile: null, memo: "", isSection: false }
        ];
    }
    console.log('Rendering program table');
    renderProgramTable();
    console.log('App initialization completed');
}

export function updateProgramData(newData) {
    console.log('Updating program data', newData);
    programData = newData;
    saveToLocalStorage();
    renderProgramTable();
}

console.log('app.js execution completed');

