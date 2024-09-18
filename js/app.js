import { loadFromLocalStorage, saveToLocalStorage } from '/sports-music/js/storage.js';
import { renderProgramTable } from '/sports-music/js/render.js';

console.log('app.js is executing');

export let programData = [];

export function initializeApp() {
    console.log('Initializing app');
    const loadedData = loadFromLocalStorage();
    if (loadedData && loadedData.length > 0) {
        console.log('Data loaded from local storage');
        programData = loadedData;
    } else {
        console.log('Initializing with default data');
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
    console.log('Program data initialized:', programData);
    renderProgramTable();
    console.log('App initialization completed');
}

export function updateProgramData(newData) {
    console.log('Updating program data', newData);
    if (newData && Array.isArray(newData)) {
        programData = newData;
        saveToLocalStorage(programData);
        renderProgramTable();
    } else {
        console.error('Invalid data provided to updateProgramData:', newData);
    }
}

console.log('app.js execution completed');
