let programData = [];
let audioFiles = {};
let currentAudio = null;
let sortable;

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    if (programData.length === 0) {
        programData.push({ time: "", program: "", audioSource: "--", trackNumber: "01", memo: "", isSection: false });
    }
    renderProgramTable();
    setupEventListeners();
    initSortable();
});

function setupEventListeners() {
    document.getElementById('select-audio-files').addEventListener('click', () => {
        document.getElementById('audio-file-input').click();
    });

    document.getElementById('audio-file-input').addEventListener('change', handleFileSelect);

    document.getElementById('check-all-files').addEventListener('click', checkAllFiles);
}

function initSortable() {
    const el = document.getElementById('program-body');
    sortable = Sortable.create(el, {
        animation: 150,
        // handleクラスを削除し、行全体をドラッグ可能にする
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
        // カーソルスタイルを変更して、ドラッグ可能であることを示す
        row.style.cursor = 'move';
        if (item.isSection) {
            row.innerHTML = `
                <td colspan="8" style="background-color: #f0f0f0;">
                    <input type="text" value="${item.program}" onchange="updateProgram(${index}, 'program', this.value)" style="width: 100%; background-color: transparent; border: none;">
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
                           onchange="updateProgram(${index}, 'trackNumber', this.value.padStart(2, '0'))" class="edit-select">
                </td>
                <td><input type="text" value="${item.memo}" onchange="updateProgram(${index}, 'memo', this.value)"></td>
                <td id="status-${item.audioSource}-${item.trackNumber}"></td>
                <td>
                    <button onclick="toggleMusic('${item.audioSource}', '${item.trackNumber}')">▶ 再生/停止</button>
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

function addSection(index) {
    const sectionName = prompt("セクション名を入力してください：");
    if (sectionName) {
        programData.splice(index, 0, { program: sectionName, isSection: true });
        renderProgramTable();
        saveToLocalStorage();
    }
}

function addProgram(index) {
    programData.splice(index + 1, 0, { time: "", program: "", audioSource: "--", trackNumber: "01", memo: "", isSection: false });
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
    programData.forEach(item => {
        if (!item.isSection && item.time && item.program) {
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
