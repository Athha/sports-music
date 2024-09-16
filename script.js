let programData = [
    { time: "09:00", program: "開会式", audioSource: "A", trackNumber: "01" },
    { time: "09:30", program: "100m走", audioSource: "B", trackNumber: "03" },
    { time: "10:00", program: "玉入れ", audioSource: "C", trackNumber: "07" },
];

let audioFiles = {};

document.addEventListener('DOMContentLoaded', () => {
    renderProgramTable();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('select-audio-files').addEventListener('click', () => {
        document.getElementById('audio-file-input').click();
    });

    document.getElementById('audio-file-input').addEventListener('change', handleFileSelect);

    document.getElementById('add-program-form').addEventListener('submit', handleAddProgram);
}

function handleFileSelect(event) {
    const files = event.target.files;
    for (let file of files) {
        const match = file.name.match(/^([abc])(\d{2})\.mp3$/i);
        if (match) {
            const [, source, number] = match;
            audioFiles[`${source.toUpperCase()}-${number}`] = file;
        }
    }
    renderProgramTable();
}

function renderProgramTable() {
    const tableBody = document.querySelector('#program-table tbody');
    tableBody.innerHTML = '';
    
    programData.forEach((item, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${item.time}</td>
            <td>${item.program}</td>
            <td>${item.audioSource}</td>
            <td>${item.trackNumber}</td>
            <td id="status-${item.audioSource}-${item.trackNumber}"></td>
            <td><button onclick="playMusic('${item.audioSource}', '${item.trackNumber}')">▶ 再生</button></td>
            <td><span class="delete-program" onclick="deleteProgram(${index})">✖</span></td>
        `;
    });
    
    updateAudioStatus();
}

function updateAudioStatus() {
    programData.forEach(item => {
        const key = `${item.audioSource}-${item.trackNumber}`;
        const statusElement = document.getElementById(`status-${key}`);
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

function playMusic(audioSource, trackNumber) {
    const key = `${audioSource}-${trackNumber}`;
    const audioFile = audioFiles[key];

    if (audioFile) {
        const audio = new Audio(URL.createObjectURL(audioFile));
        audio.play();
    } else {
        alert('音源ファイルが見つかりません。ファイルを選択してください。');
    }
}

function handleAddProgram(event) {
    event.preventDefault();
    const newProgram = {
        time: document.getElementById('new-time').value,
        program: document.getElementById('new-program').value,
        audioSource: document.getElementById('new-audio-source').value,
        trackNumber: document.getElementById('new-track-number').value.padStart(2, '0')
    };
    programData.push(newProgram);
    programData.sort((a, b) => a.time.localeCompare(b.time));
    renderProgramTable();
    event.target.reset();
}

function deleteProgram(index) {
    if (confirm('このプログラムを削除してもよろしいですか？')) {
        programData.splice(index, 1);
        renderProgramTable();
    }
}
