import { programData, updateProgramData } from './app.js';
import { saveToLocalStorage } from './storage.js';

export function addSection(index) {
    programData.splice(index + 1, 0, {
        order: "",
        program: "",
        audioFile: null,
        memo: "",
        isSection: true
    });
    updateProgramData(programData);
}

export function addProgram(index) {
    programData.splice(index + 1, 0, {
        order: "",
        program: "",
        audioFile: null,
        memo: "",
        isSection: false
    });
    updateProgramData(programData);
}

export function deleteProgram(index) {
    if (confirm('このプログラムを削除してもよろしいですか？')) {
        programData.splice(index, 1);
        updateProgramData(programData);
    }
}

export function updateProgram(index, field, value) {
    programData[index][field] = value;
    updateProgramData(programData);
}

export function checkAllFiles() {
    let missingFiles = [];
    programData.forEach((item, index) => {
        if (!item.isSection && !item.audioFile) {
            missingFiles.push(`${item.program}`);
            updateStatus(index, 'not-found');
        }
    });

    if (missingFiles.length > 0) {
        alert('以下のプログラムに音楽ファイルが選択されていません:\n' + missingFiles.join('\n'));
    } else {
        alert('全てのプログラムに音楽ファイルが選択されています。');
    }
}

export function clearStorage() {
    if (confirm('保存されているデータをすべて消去し、初期状態に戻しますか？この操作は取り消せません。')) {
        localStorage.removeItem('programData');
        location.reload(); // ページをリロードして初期状態に戻す
    }
}

function updateStatus(index, status) {
    const statusElement = document.getElementById(`status-${index}`);
    if (statusElement) {
        if (status === 'local') {
            statusElement.textContent = 'ローカル';
            statusElement.className = 'status-local';
        } else if (status === 'not-found') {
            statusElement.textContent = '未選択';
            statusElement.className = 'status-not-found';
        } else if (status === 'reselect') {
            statusElement.textContent = '要再選択';
            statusElement.className = 'status-reselect';
        }
    }
}
