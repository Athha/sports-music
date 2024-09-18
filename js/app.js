import { loadFromLocalStorage, saveToLocalStorage } from './storage.js';
import { renderProgramTable } from './render.js';

export let programData = [];

export function initializeApp() {
    loadFromLocalStorage();
    if (programData.length === 0) {
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
    renderProgramTable();
}

export function updateProgramData(newData) {
    programData = newData;
    saveToLocalStorage();
    renderProgramTable();
}
