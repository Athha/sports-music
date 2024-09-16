// プログラムデータ
const programData = [
    { time: "9:00", program: "開会式", audioSource: "A", trackNumber: "01" },
    { time: "9:30", program: "100m走", audioSource: "B", trackNumber: "03" },
    { time: "10:00", program: "玉入れ", audioSource: "C", trackNumber: "07" },
    { time: "10:30", program: "障害物競走", audioSource: "A", trackNumber: "12" },
    { time: "11:00", program: "リレー", audioSource: "B", trackNumber: "15" },
    { time: "11:30", program: "閉会式", audioSource: "C", trackNumber: "19" }
];

let currentAudio = null;
let audioStatus = {};

// 音楽再生機能
async function playMusic(audioSource, trackNumber) {
    const localPath = `audio/${audioSource.toLowerCase()}/${trackNumber}.mp3`;
    const samplePath = 'audio/sample.mp3';

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    try {
        if (audioStatus[`${audioSource}-${trackNumber}`] === 'local') {
            currentAudio = new Audio(localPath);
            await currentAudio.play();
            console.log(`ローカルファイルを再生中: ${localPath}`);
        } else {
            currentAudio = new Audio(samplePath);
            await currentAudio.play();
            console.log('サンプルファイルを再生中');
        }
    } catch (error) {
        console.error('音楽の再生に失敗しました:', error);
        alert(`音楽の再生に失敗しました。ファイルが見つからないか、ブラウザがサポートしていない可能性があります。`);
    }
}

// ファイルの存在を確認する関数
async function checkFileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.warn(`ファイルの確認中にエラーが発生しました: ${url}`, error);
        return false;
    }
}

// テーブル生成関数
function generateTable() {
    const table = document.getElementById('program-table');
    
    programData.forEach(item => {
        const row = table.insertRow();
        row.insertCell(0).textContent = item.time;
        row.insertCell(1).textContent = item.program;
        row.insertCell(2).textContent = item.audioSource;
        const statusCell = row.insertCell(3);
        statusCell.id = `status-${item.audioSource}-${item.trackNumber}`;
        statusCell.textContent = '確認中...';
        const musicCell = row.insertCell(4);
        const button = document.createElement('button');
        button.textContent = "▶ 再生";
        button.onclick = () => playMusic(item.audioSource, item.trackNumber);
        musicCell.appendChild(button);
    });
}

// 全てのファイルの存在をチェックし、状態を更新
async function checkAllFiles() {
    document.getElementById('loading-message').style.display = 'block';

    for (const item of programData) {
        const key = `${item.audioSource}-${item.trackNumber}`;
        const path = `audio/${item.audioSource.toLowerCase()}/${item.trackNumber}.mp3`;
        const exists = await checkFileExists(path);
        
        if (exists) {
            audioStatus[key] = 'local';
            updateStatus(key, 'ローカル', 'status-local');
        } else {
            const sampleExists = await checkFileExists('audio/sample.mp3');
            if (sampleExists) {
                audioStatus[key] = 'sample';
                updateStatus(key, 'サンプル', 'status-sample');
            } else {
                audioStatus[key] = 'not-found';
                updateStatus(key, '未検出', 'status-not-found');
            }
        }
    }

    document.getElementById('loading-message').style.display = 'none';
}

// 状態表示を更新
function updateStatus(key, text, className) {
    const statusElement = document.getElementById(`status-${key}`);
    if (statusElement) {
        statusElement.textContent = text;
        statusElement.className = className;
    }
}

// フルパスを計算して表示する関数
function displayFullPath() {
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    const fullPath = `${window.location.origin}${basePath}audio/`;

    const pathInfo = document.getElementById('audio-full-path');
    pathInfo.innerHTML = `
        <strong>フルパス:</strong> ${fullPath}<br><br>
        <strong>ディレクトリ構造:</strong><br>
        ${fullPath}<br>
        ├── a/<br>
        │   ├── 01.mp3<br>
        │   ├── 02.mp3<br>
        │   └── ...<br>
        ├── b/<br>
        │   ├── 01.mp3<br>
        │   ├── 02.mp3<br>
        │   └── ...<br>
        ├── c/<br>
        │   ├── 01.mp3<br>
        │   ├── 02.mp3<br>
        │   └── ...<br>
        └── sample.mp3
    `;
}

// DOMが読み込まれた後に実行する既存のコードを更新
document.addEventListener('DOMContentLoaded', () => {
    generateTable();
    checkAllFiles();
    displayFullPath();  // この行を追加
});

