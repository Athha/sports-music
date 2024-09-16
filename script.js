// プログラムデータ
const programData = [
    { time: "9:00", program: "開会式", music: "sample.mp3" },
    { time: "9:30", program: "100m走", music: "sample.mp3" },
    { time: "10:00", program: "玉入れ", music: "sample.mp3" },
    { time: "10:30", program: "障害物競走", music: "sample.mp3" },
    { time: "11:00", program: "リレー", music: "sample.mp3" },
    { time: "11:30", program: "閉会式", music: "sample.mp3" }
];

// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('program-table');
    
    // プログラムデータをテーブルに追加
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

    // テスト用の再生ボタンを追加
    const testButton = document.createElement('button');
    testButton.textContent = "サンプル音楽をテスト";
    testButton.onclick = () => playMusic('sample.mp3');
    document.body.insertBefore(testButton, table);

    // Service Workerの登録
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
});

// 音楽再生機能
let currentAudio = null;

function playMusic(filename) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(`audio/${filename}`);
    currentAudio.play()
        .catch(error => {
            console.error('音楽の再生に失敗しました:', error);
            alert('音楽の再生に失敗しました。ファイルが見つからないか、ブラウザがサポートしていない可能性があります。');
        });
}

// オフライン/オンライン状態の管理
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const status = navigator.onLine ? 'オンライン' : 'オフライン';
    console.log(`アプリケーションは現在 ${status} です。`);
    // ここに必要に応じてUIの更新処理を追加
}

// 初期状態のチェック
updateOnlineStatus();
