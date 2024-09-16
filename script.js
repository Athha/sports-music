// ローカルファイルの保存用オブジェクト
let localAudioFiles = {};

// ファイル入力のイベントリスナー
document.getElementById('local-audio-files').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const files = event.target.files;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.match('audio.*')) {
            const eventName = file.name.replace('event_', '').replace('.mp3', '');
            localAudioFiles[eventName] = file;
        }
    }

    console.log('選択されたローカルファイル:', Object.keys(localAudioFiles));
}

// 音楽再生機能の更新
function playMusic(eventName) {
    const audioFile = localAudioFiles[eventName] || `audio/sample.mp3`;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    if (audioFile instanceof File) {
        // ローカルファイルの場合
        const objectUrl = URL.createObjectURL(audioFile);
        currentAudio = new Audio(objectUrl);
    } else {
        // サンプルファイルの場合
        currentAudio = new Audio(audioFile);
    }

    currentAudio.play()
        .catch(error => {
            console.error('音楽の再生に失敗しました:', error);
            alert('音楽の再生に失敗しました。ファイルが正しくないか、ブラウザがサポートしていない可能性があります。');
        });
}

// プログラムデータの更新
const programData = [
    { time: "9:00", program: "開会式", music: "opening" },
    { time: "9:30", program: "100m走", music: "100m" },
    { time: "10:00", program: "玉入れ", music: "tamaire" },
    { time: "10:30", program: "障害物競走", music: "obstacle" },
    { time: "11:00", program: "リレー", music: "relay" },
    { time: "11:30", program: "閉会式", music: "closing" }
];

// テーブル生成関数の更新
function generateTable() {
    const table = document.getElementById('program-table');
    
    programData.forEach(item => {
        const row = table.insertRow();
        row.insertCell(0).textContent = item.time;
        row.insertCell(1).textContent = item.program;
        const musicCell = row.insertCell(2);
        const button = document.createElement('button');
        button.textContent = "▶ 再生";
        button.onclick = () => playMusic(item.music);
        musicCell.appendChild(button);
    });
}

// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', generateTable);
