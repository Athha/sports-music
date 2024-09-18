let programData = [];
let audioFiles = {};
let currentAudio = null;
let sortable;
let isFileSystemAccessSupported = false;

document.addEventListener('DOMContentLoaded', () => {
    checkFileSystemAccessSupport();
    loadFromLocalStorage();
    if (programData.length === 0) {
        // 初期データの設定
        programData = [
            { time: "", program: "開会式", audioSource: "--", trackNumber: "", memo: "", isSection: true },
            { time: "", program: "入場", audioSource: "--", trackNumber: "", memo: "", isSection: false },
            { time: "", program: "はじめのことば", audioSource: "--", trackNumber: "", memo: "", isSection: false },
            { time: "", program: "君が代の歌", audioSource: "--", trackNumber: "", memo: "", isSection: false },
            { time: "", program: "演技", audioSource: "--", trackNumber: "", memo: "", isSection: true },
            { time: "", program: "力を合わせて", audioSource: "--", trackNumber: "", memo: "", isSection: false },
            { time: "", program: "閉会式", audioSource: "--", trackNumber: "", memo: "", isSection: true },
            { time: "", program: "入場", audioSource: "--", trackNumber: "", memo: "", isSection: false }
        ];
    }
    renderProgramTable();
    setupEventListeners();
    initSortable();
    checkAudioFilesStatus();
});

function checkFileSystemAccessSupport() {
    isFileSystemAccessSupported = 'showOpenFilePicker' in window;
}

function setupEventListeners() {
    document.getElementById('select-audio-files').addEventListener('click', () => {
        if (isFileSystemAccessSupported) {
            handleFileSelect();
        } else {
            document.getElementById('audio-file-input').click();
        }
    });

    document.getElementById('audio-file-input').addEventListener('change', handleFileSelect);

    document.getElementById('check-all-files').addEventListener('click', checkAllFiles);

    document.getElementById('clear-storage').addEventListener('click', clearStorage);

    document.getElementById('stop-all-music').addEventListener('click', stopAllMusic);

    window.addEventListener('focus', () => {
        checkAudioFilesStatus();
    });
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

async function handleFileSelect(event) {
    let files;
    if (isFileSystemAccessSupported) {
        try {
            const fileHandles = await window.showOpenFilePicker({
                multiple: true,
                types: [{
                    description: 'Audio Files',
                    accept: {'audio/*': ['.mp3']}
                }]
            });
            files = await Promise.all(fileHandles.map(handle => handle.getFile()));
        } catch (err) {
            console.error('File selection was cancelled or failed:', err);
            return;
        }
    } else {
        files = event.target.files;
    }

    audioFiles = {};
    for (let file of files) {
        const match = file.name.match(/^(?:([abc]))?(\d{2})\.mp3$/i);
        if (match) {
            const [, source, number] = match;
            const key = source ? `${source.toUpperCase()}-${number}` : number;
            audioFiles[key] = file;
        }
    }
    renderProgramTable();
    saveToLocalStorage();
    checkAudioFilesStatus();
}

function checkAudioFilesStatus() {
    let missingFiles = false;
    programData.forEach((item, index) => {
        if (!item.isSection && item.audioSource !== "--" && item.trackNumber) {
            const key = item.audioSource === '--' ? item.trackNumber : `${item.audioSource}-${item.trackNumber}`;
            if (!audioFiles[key]) {
                missingFiles = true;
                updateStatus(index, 'not-found');
            } else {
                updateStatus(index, 'local');
            }
        }
    });

    const statusMessage = document.getElementById('status-message');
    if (missingFiles) {
        statusMessage.textContent = '一部の音楽ファイルが見つかりません。ファイルを再選択してください。';
        statusMessage.style.display = 'block';
    } else if (Object.keys(audioFiles).length === 0) {
        statusMessage.textContent = '音楽ファイルが選択されていません。ファイルを選択してください。';
        statusMessage.style.display = 'block';
    } else {
        statusMessage.style.display = 'none';
    }
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
                <td colspan="7" style="background-color: #f0f0f0;">
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
                    <select class="edit-select" onchange="updateProgram(${index}, 'audioSource', this.value)">
                        <option value="--" ${item.audioSource === '--' ? 'selected' : ''}>--</option>
                        <option value="A" ${item.audioSource === 'A' ? 'selected' : ''}>A</option>
                        <option value="B" ${item.audioSource === 'B' ? 'selected' : ''}>B</option>
                        <option value="C" ${item.audioSource === 'C' ? 'selected' : ''}>C</option>
                    </select>
                </td>
                <td>
                    <input type="number" min="1" max="99" value="${item.trackNumber}" 
                           oninput="this.value = this.value.padStart(2, '0')"
                           onchange="updateProgram(${index}, 'trackNumber', this.value.padStart(2, '0'))" class="edit-select">
                </td>
                <td><input type="text" value="${item.memo}" onchange="updateProgram(${index}, 'memo', this.value)"></td>
                <td id="status-${item.audioSource}-${item.trackNumber}"></td>
                <td>
                    <button onclick="toggleMusic('${item.audioSource}', '${item.trackNumber}')">▶ 再生</button>
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

function updateAudioStatus() {
    programData.forEach((item, index) => {
        if (!item.isSection) {
            const key = item.audioSource === '--' ? item.trackNumber : `${item.audioSource}-${item.trackNumber}`;
            if (item.audioSource !== "--" && item.trackNumber) {
                if (audioFiles[key]) {
                    updateStatus(index, 'local');
                } else {
                    updateStatus(index, 'not-found');
                }
            } else {
                updateStatus(index, 'not-found');
            }
        }
    });
}

function updateStatus(index, status) {
    const item = programData[index];
    const statusElement = document.getElementById(`status-${item.audioSource}-${item.trackNumber}`);
    if (statusElement) {
        if (status === 'local') {
            statusElement.textContent = 'ローカル';
            statusElement.className = 'status-local';
        } else {
            statusElement.textContent = '未検出';
            statusElement.className = 'status-not-found';
        }
    }
}

function toggleMusic(audioSource, trackNumber) {
    const key = audioSource === '--' ? trackNumber : `${audioSource}-${trackNumber}`;
    const audioFile = audioFiles[key];

    if (currentAudio) {
        if (currentAudio.src === URL.createObjectURL(audioFile)) {
            if (currentAudio.paused) {
                currentAudio.play();
                updatePlayButtonText(audioSource, trackNumber, '■ 停止');
            } else {
                currentAudio.pause();
                updatePlayButtonText(audioSource, trackNumber, '▶ 再生');
            }
            return;
        } else {
            currentAudio.pause();
            updateAllPlayButtonsText();
        }
    }

    if (audioFile) {
        currentAudio = new Audio(URL.createObjectURL(audioFile));
        currentAudio.play();
        updatePlayButtonText(audioSource, trackNumber, '■ 停止');
    } else {
        alert('音源ファイルが見つかりません。ファイルを選択してください。');
    }
}

function stopAllMusic() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    updateAllPlayButtonsText();
}

function updatePlayButtonText(audioSource, trackNumber, text) {
    const button = document.querySelector(`button[onclick="toggleMusic('${audioSource}', '${trackNumber}')"]`);
    if (button) {
        button.textContent = text;
    }
}

function updateAllPlayButtonsText() {
    const buttons = document.querySelectorAll('button[onclick^="toggleMusic"]');
    buttons.forEach(button => {
        button.textContent = '▶ 再生';
    });
}

function addSection(index) {
    programData.splice(index, 0, {
        time: "",
        program: "",
        audioSource: "--",
        trackNumber: "",
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
        audioSource: "--",
        trackNumber: "01",
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
    let allFound = true;
    programData.forEach((item, index) => {
        if (!item.isSection) {
            const key = item.audioSource === '--' ? item.trackNumber : `${item.audioSource}-${item.trackNumber}`;
            if (item.audioSource !== "--" && item.trackNumber) {
                if (!audioFiles[key]) {
                    missingFiles.push(`${item.program}: ${key}.mp3`);
                    allFound = false;
                    updateStatus(index, 'not-found');
                } else {
                    updateStatus(index, 'local');
                }
            } else {
                updateStatus(index, 'not-found');
            }
        }
    });

    if (!allFound) {
        alert('以下のファイルが見つかりません:\n' + missingFiles.join('\n'));
    } else if (missingFiles.length === 0) {
        alert('全ての音源ファイルが見つかりました。');
    } else {
        alert('音源が設定されていない項目があります。');
    }
    renderProgramTable(); // テーブルを再描画して状態を更新
}

function clearStorage() {
    if (confirm('保存されているデータをすべて消去し、初期状態に戻しますか？この操作は取り消せません。')) {
        localStorage.removeItem('programData');
        localStorage.removeItem('audioFileNames');
        // 初期データの再設定
        programData = [
            { time: "", program: "開会式", audioSource: "--", trackNumber: "", memo: "", isSection: true },
            { time: "", program: "入場", audioSource: "--", trackNumber: "", memo: "", isSection: false },
            { time: "", program: "はじめのことば", audioSource: "--", trackNumber: "", memo: "", isSection: false },
            { time: "", program: "君が代の歌", audioSource: "--", trackNumber: "", memo: "", isSection: false },
            { time: "", program: "演技", audioSource: "--", trackNumber: "", memo: "", isSection: true },
            { time: "", program: "力を合わせて", audioSource: "--", trackNumber: "", memo: "", isSection: false },
            { time: "", program: "閉会式", audioSource: "--", trackNumber: "", memo: "", isSection: true },
            { time: "", program: "入場", audioSource: "--", trackNumber: "", memo: "", isSection: false }
        ];
        audioFiles = {};
        renderProgramTable();
        alert('データが消去され、初期状態に戻りました。');
    }
}

function saveToLocalStorage() {
    localStorage.setItem('programData', JSON.stringify(programData));
    
    // AudioFileのメタデータのみを保存
    const audioFileMetadata = Object.keys(audioFiles).reduce((acc, key) => {
        acc[key] = {
            name: audioFiles[key].name,
            lastModified: audioFiles[key].lastModified
        };
        return acc;
    }, {});
    localStorage.setItem('audioFileMetadata', JSON.stringify(audioFileMetadata));
}

function loadFromLocalStorage() {
    const savedProgramData = localStorage.getItem('programData');
    if (savedProgramData) {
        programData = JSON.parse(savedProgramData);
    }

    const savedAudioFileMetadata = localStorage.getItem('audioFileMetadata');
    if (savedAudioFileMetadata) {
        const metadata = JSON.parse(savedAudioFileMetadata);
        audioFiles = Object.keys(metadata).reduce((acc, key) => {
            acc[key] = {
                name: metadata[key].name,
                lastModified: metadata[key].lastModified
            };
            return acc;
        }, {});
    }
}
