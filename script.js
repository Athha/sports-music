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
});

function setupEventListeners() {
    document.getElementById('check-all-files').addEventListener('click', checkAllFiles);
    document.getElementById('clear-storage').addEventListener('click', clearStorage);
    document.getElementById('stop-all-music').addEventListener('click', stopAllMusic);
}

function initSortable() {
    const el = document.getElementById('program-body');
    sortable = Sortable.create(el, {
        animation: 150,
        onEnd: function (evt) {
            const newIndex = evt.newIndex;
            const oldIndex = evt.oldIndex;
            
            const [movedItem] = programData.splice(oldIndex, 1);
            programData.splice(newIndex, 0, movedItem);
            
            saveToLocalStorage();
        }
    });
}

function renderProgramTable() {
    const tableBody = document.querySelector('#program-table tbody');
    tableBody.innerHTML = '';
    
    programData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', index);
        row.style.cursor = 'move';
        if (item.isSection) {
            row.innerHTML = `
                <td colspan="6" style="background-color: #f0f0f0;">
                    <input type="text" value="${item.program}" onchange="updateProgram(${index}, 'program', this.value)" style="width: 100%; background-color: transparent; border: none;" placeholder="セクション名を入力">
                </td>
                <td>
                    <span class="add-program" onclick="addProgram(${index})">＋</span>
                    <span class="add-section" onclick="addSection(${index + 1})">＊</span>
                    <span class="delete-program" onclick="deleteProgram(${index})">✖</span>
                </td>
            `;
        } else {
            row.innerHTML = `
                <td><input type="time" value="${item.time}" onchange="updateProgram(${index}, 'time', this.value)"></td>
                <td><input type="text" value="${item.program}" onchange="updateProgram(${index}, 'program', this.value)"></td>
                <td>
                    <input type="file" accept="audio/*" onchange="handleFileSelect(event, ${index})" style="display: none;" id="file-input-${index}">
                    <button onclick="document.getElementById('file-input-${index}').click()">音楽選択</button>
                    <span id="file-name-${index}">${item.audioFile ? item.audioFile.name : '未選択'}</span>
                </td>
                <td><input type="text" value="${item.memo}" onchange="updateProgram(${index}, 'memo', this.value)"></td>
                <td id="status-${index}"></td>
                <td>
                    <button onclick="toggleMusic(${index})">▶ 再生</button>
                </td>
                <td>
                    <span class="add-program" onclick="addProgram(${index})">＋</span>
                    <span class="add-section" onclick="addSection(${index + 1})">＊</span>
                    <span class="delete-program" onclick="deleteProgram(${index})">✖</span>
                </td>
            `;
        }
        tableBody.appendChild(row);
    });
    
    updateAudioStatus();
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
        } else {
            statusElement.textContent = '未選択';
            statusElement.className = 'status-not-found';
        }
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
