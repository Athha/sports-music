import { loadFromLocalStorage, saveToLocalStorage, prepareForExport, restoreFromImport } from '/sports-music/js/storage.js';
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

export async function exportProgramData() {
    try {
        const exportData = await prepareForExport(programData);
        if (!exportData) {
            throw new Error('Failed to prepare data for export');
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sports-day-program-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting program data:', error);
        alert('プログラムデータのエクスポートに失敗しました。');
    }
}

export async function importProgramData(file) {
    try {
        const text = await file.text();
        const importData = JSON.parse(text);
        const restoredData = await restoreFromImport(importData);
        
        if (!restoredData) {
            throw new Error('Failed to restore data from import');
        }

        // データを更新する前に、既存のデータをクリア
        programData = [];
        await saveToLocalStorage(programData);

        // 新しいデータを設定
        programData = restoredData;
        await saveToLocalStorage(programData);
        renderProgramTable();
        alert('プログラムデータのインポートが完了しました。');
    } catch (error) {
        console.error('Error importing program data:', error);
        alert('プログラムデータのインポートに失敗しました。');
    }
}

console.log('app.js execution completed');
