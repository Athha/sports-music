// アプリケーションのバージョン
const APP_VERSION = "1.0.2";

let programData = [];
let sortable;

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    if (programData.length === 0) {
        // 初期データの設定
        programData = [
            { time: "", program: "開会式", audioFile: null, memo: "", isSection: true },
            { time: "", program: "入場", audioFile: null, memo: "", isSection: false },
            { time: "", program: "はじめのことば", audioFile: null, memo: "", isSection: false },
            { time: "", program: "君が代の歌", audioFile: null, memo: "", isSection: false },
            { time: "", program: "演技", audioFile: null, memo: "", isSection: true },
            { time: "", program: "力を合わせて", audioFile: null, memo: "", isSection: false },
            { time: "", program: "閉会式", audioFile: null, memo: "", isSection: true },
            { time: "", program: "入場", audioFile: null, memo: "", isSection: false }
        ];
    }
    renderProgramTable();
    setupEventListeners();
    initSortable();
    displayVersion();
    checkAudioFileStatus();
});

function displayVersion() {
    document.getElementById('app-version').textContent = APP_VERSION;
}

function setupEventListeners() {
    document.getElementById('check-all-files').addEventListener('click', checkAllFiles);
    document.getElementById('clear-storage').addEventListener('click', clearStorage);
    document.getElementById('stop-all-music').addEventListener('click', stopAllMusic);
}

function initSortable() {
    const el = document.getElementById('program-body');
    sortable = Sortable.create(el, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: function (evt) {
            const newIndex = evt.newIndex;
            const oldIndex = evt.oldIndex;
            
            const [movedItem] = programData.splice(oldIndex, 1);
            programData.splice(newIndex, 0, movedItem);
            
            saveToLocalStorage();
        }
    });
}

function handleTablePaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.trim().split('\n');
    
    const newData = rows.map(row => {
        const [order, program, memo] = row.split('\t');
        return { 
            order: order ? order.trim() : '', 
            program: program ? program.trim() : '', 
            memo: memo ? memo.trim() : '' 
        };
    });

    // 既存のデータを更新または新しいデータを追加
    newData.forEach(item => {
        if (item.program) {  // プログラム名が存在する場合のみ処理
            const existingIndex = programData.findIndex(existing => 
                existing.order === item.order && !existing.isSection);
            
            if (existingIndex !== -1) {
                // 既存のデータを更新
                programData[existingIndex].program = item.program;
                if (item.memo) {
                    programData[existingIndex].memo = item.memo;
                }
            } else {
                // 新しいデータを追加
                programData.push({
                    order: item.order,
                    program: item.program,
                    memo: item.memo,
                    audioFile: null,
                    isSection: false
                });
            }
        }
    });

    // テーブルを再描画
    renderProgramTable();
    saveToLocalStorage();
}

function renderProgramTable() {
    const tableBody = document.querySelector('#program-table tbody');
    tableBody.innerHTML = '';
    
    programData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', index);
        
        // 順序列（共通）
        row.innerHTML = `
            <td class="order-column">
                <span class="drag-handle">≡</span>
                <input type="text" value="${item.order || ''}" onchange="updateProgram(${index}, 'order', this.value)" 
                       onpaste="handleOrderPaste(event, ${index})" placeholder="順" class="order-input" maxlength="2">
            </td>
        `;

        // ... (残りの部分は変更なし)

        tableBody.appendChild(row);
    });
    
    updateAudioStatus();
}

function handleOrderPaste(event, index) {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const rows = pastedData.trim().split('\n');
    
    const newData = rows.map(row => {
        const [order, program, memo] = row.split('\t');
        return { 
            order: order ? order.trim() : '', 
            program: program ? program.trim() : '', 
            memo: memo ? memo.trim() : '' 
        };
    });

    // 既存のデータを更新または新しいデータを追加
    newData.forEach((item, i) => {
        if (item.order || item.program) {  // 順序またはプログラム名が存在する場合のみ処理
            const currentIndex = index + i;
            if (currentIndex < programData.length) {
                // 既存のデータを更新
                if (!programData[currentIndex].isSection) {
                    programData[currentIndex].order = item.order;
                    programData[currentIndex].program = item.program || programData[currentIndex].program;
                    programData[currentIndex].memo = item.memo || programData[currentIndex].memo;
                }
            } else {
                // 新しいデータを追加
                programData.push({
                    order: item.order,
                    program: item.program,
                    memo: item.memo,
                    audioFile: null,
                    isSection: false
                });
            }
        }
    });

    // テーブルを再描画
    renderProgramTable();
    saveToLocalStorage();
}

function updateAudioStatus() {
    programData.forEach((item, index) => {
        if (!item.isSection) {
            if (item.audioFile) {
                updateStatus(index, 'local');
            } else {
                updateStatus(index, 'not-found');
            }
        }
    });
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

function checkAudioFileStatus() {
    programData.forEach((item, index) => {
        if (!item.isSection && item.audioFile) {
            if (!isValidBlobUrl(item.audioFile)) {
                updateStatus(index, 'reselect');
                item.audioFile = null; // ファイル情報をクリア
            }
        }
    });
    saveToLocalStorage();
}

function isValidBlobUrl(file) {
    return file && file instanceof File;
}

function handleFileSelect(event, index) {
    const file = event.target.files[0];
    if (file) {
        programData[index].audioFile = file;
        document.getElementById(`file-name-${index}`).textContent = file.name;
        updateStatus(index, 'local');
        saveToLocalStorage();
    }
}

let currentAudio = null;
let currentAudioIndex = null;

function toggleMusic(index) {
    const item = programData[index];
    if (!item.audioFile) {
        alert('音楽ファイルが選択されていません。');
        return;
    }

    if (currentAudio && currentAudioIndex === index) {
        if (currentAudio.paused) {
            currentAudio.play();
            updatePlayButtonText(index, '■ 停止');
        } else {
            currentAudio.pause();
            updatePlayButtonText(index, '▶ 再生');
        }
    } else {
        if (currentAudio) {
            currentAudio.pause();
            updatePlayButtonText(currentAudioIndex, '▶ 再生');
        }
        currentAudio = new Audio(URL.createObjectURL(item.audioFile));
        currentAudioIndex = index;
        currentAudio.play();
        updatePlayButtonText(index, '■ 停止');
    }
}

function stopAllMusic() {
    if (currentAudio) {
        currentAudio.pause();
        updatePlayButtonText(currentAudioIndex, '▶ 再生');
        currentAudio = null;
        currentAudioIndex = null;
    }
}

function updatePlayButtonText(index, text) {
    const button = document.querySelector(`button[onclick="toggleMusic(${index})"]`);
    if (button) {
        button.textContent = text;
    }
}

function addSection(index) {
    programData.splice(index, 0, {
        time: "",
        program: "",
        audioFile: null,
        memo: "",
        isSection: true
    });
    renderProgramTable();
    saveToLocalStorage();
}

function addProgram(index) {
    programData.splice(index + 1, 0, {
        time: "",
        program: "",
        audioFile: null,
        memo: "",
        isSection: false
    });
    renderProgramTable();
    saveToLocalStorage();
}

function deleteProgram(index) {
    if (confirm('このプログラムを削除してもよろしいですか？')) {
        programData.splice(index, 1);
        renderProgramTable();
        saveToLocalStorage();
    }
}

function updateProgram(index, field, value) {
    programData[index][field] = value;
    saveToLocalStorage();
}

function checkAllFiles() {
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

function clearStorage() {
    if (confirm('保存されているデータをすべて消去し、初期状態に戻しますか？この操作は取り消せません。')) {
        localStorage.removeItem('programData');
        // 初期データの再設定
        programData = [
            { time: "", program: "開会式", audioFile: null, memo: "", isSection: true },
            { time: "", program: "入場", audioFile: null, memo: "", isSection: false },
            { time: "", program: "はじめのことば", audioFile: null, memo: "", isSection: false },
            { time: "", program: "君が代の歌", audioFile: null, memo: "", isSection: false },
            { time: "", program: "演技", audioFile: null, memo: "", isSection: true },
            { time: "", program: "力を合わせて", audioFile: null, memo: "", isSection: false },
            { time: "", program: "閉会式", audioFile: null, memo: "", isSection: true },
            { time: "", program: "入場", audioFile: null, memo: "", isSection: false }
        ];
        renderProgramTable();
        alert('データが消去され、初期状態に戻りました。');
    }
}

function saveToLocalStorage() {
    const dataToSave = programData.map(item => {
        if (item.audioFile) {
            return {
                ...item,
                audioFile: {
                    name: item.audioFile.name,
                    type: item.audioFile.type,
                    lastModified: item.audioFile.lastModified
                }
            };
        }
        return item;
    });
    localStorage.setItem('programData', JSON.stringify(dataToSave));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('programData');
    if (savedData) {
        programData = JSON.parse(savedData);
        // audioFileのメタデータを実際のFileオブジェクトに変換する処理は省略します
        // 実際のアプリケーションでは、ファイルの再選択を促すなどの対応が必要です
    }
}
