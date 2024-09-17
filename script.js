let programData = [];
let audioFiles = {};
let currentAudio = null;

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    if (programData.length === 0) {
        // 初期データがない場合、空の行を1つ追加
        programData.push({ time: "", program: "", audioSource: "--", trackNumber: "01", memo: "" });
    }
    renderProgramTable();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('select-audio-files').addEventListener('click', () => {
        document.getElementById('audio-file-input').click();
    });

    document.getElementById('audio-file-input').addEventListener('change', handleFileSelect);

    document.getElementById('check-all-files').addEventListener('click', checkAllFiles);
}

function handleFileSelect(event) {
    const files = event.target.files;
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
}

function renderProgramTable() {
    const tableBody = document.querySelector('#program-table tbody');
    tableBody.innerHTML = '';
    
    programData.forEach((item, index) => {
        const row = tableBody.insertRow();
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
                       onchange="updateProgram(${index}, 'trackNumber', this.value.padStart(2, '0'))" class="edit-select">
            </td>
            <td><input type="text" value="${item.memo}" onchange="updateProgram(${index}, 'memo', this.value)"></td>
            <td id="status-${item.audioSource}-${item.trackNumber}"></td>
            <td>
                <button onclick="toggleMusic('${item.audioSource}', '${item.trackNumber}')">▶ 再生/停止</button>
            </td>
            <td>
                <span class="add-program" onclick="addProgram(${index})">＋</span>
                <span class="delete-program" onclick="deleteProgram(${index})">✖</span>
            </td>
        `;
    });
    
    updateAudioStatus();
}

function updateAudioStatus() {
    programData.forEach(item => {
        const key = item.audioSource === '--' ? item.trackNumber : `${item.audioSource}-${item.trackNumber}`;
        const statusElement = document.getElementById(`status-${item.audioSource}-${item.trackNumber}`);
        if (statusElement) {
            if (audioFiles[key]) {
                statusElement.textContent = 'ローカル';
                statusElement.className = 'status-local';
            } else {
                statusElement.textContent = '未検出';
                statusElement.className = 'status-not-found';
            }
        }
    });
}

function toggleMusic(audioSource, trackNumber) {
    const key = audioSource === '--' ? trackNumber : `${audioSource}-${trackNumber}`;
    const audioFile = audioFiles[key];

    if (currentAudio) {
        currentAudio.pause();
        if (currentAudio.src === URL.createObjectURL(audioFile)) {
            currentAudio = null;
            return;
        }
    }

    if (audioFile) {
        currentAudio = new Audio(URL.createObjectURL(audioFile));
        currentAudio.play();
    } else {
        alert('音源ファイルが見つかりません。ファイルを選択してください。');
    }
}

function addProgram(index) {
    programData.splice(index + 1, 0, { time: "", program: "", audioSource: "--", trackNumber: "01", memo: "" });
    renderProgramTable();
    saveToLocalStorage();
}

function deleteProgram(index) {
    if (programData.length > 1 && confirm('このプログラムを削除してもよろしいですか？')) {
        programData.splice(index, 1);
        renderProgramTable();
        saveToLocalStorage();
    }
}

function updateProgram(index, field, value) {
    programData[index][field] = value;
    if (field === 'time') {
        programData.sort((a, b) => a.time.localeCompare(b.time));
    }
    renderProgramTable();
    saveToLocalStorage();
}

function checkAllFiles() {
    let missingFiles = [];
    programData.forEach(item => {
        if (item.time && item.program) {  // 空の行はチェックしない
            const key = item.audioSource === '--' ? item.trackNumber : `${item.audioSource}-${item.trackNumber}`;
            if (!audioFiles[key]) {
                missingFiles.push(`${item.program}: ${key}.mp3`);
            }
        }
    });

    if (missingFiles.length > 0) {
        alert('以下のファイルが見つかりません:\n' + missingFiles.join('\n'));
    } else {
        alert('全ての音源ファイルが見つかりました。');
    }
}

function saveToLocalStorage() {
    localStorage.setItem('programData', JSON.stringify(programData));
    
    const audioFileNames = Object.keys(audioFiles).reduce((acc, key) => {
        acc[key] = audioFiles[key].name;
        return acc;
    }, {});
    localStorage.setItem('audioFileNames', JSON.stringify(audioFileNames));
}

function loadFromLocalStorage() {
    const savedProgramData = localStorage.getItem('programData');
    if (savedProgramData) {
        programData = JSON.parse(savedProgramData);
    }

    const savedAudioFileNames = localStorage.getItem('audioFileNames');
    if (savedAudioFileNames) {
        const fileNames = JSON.parse(savedAudioFileNames);
        audioFiles = Object.keys(fileNames).reduce((acc, key) => {
            acc[key] = { name: fileNames[key] };
            return acc;
        }, {});
    }
}
