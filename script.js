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

// 音楽再生機能
async function playMusic(audioSource, trackNumber) {
    const localPath = `audio/${audioSource.toLowerCase()}/${trackNumber}.mp3`;
    const samplePath = 'audio/sample.mp3';

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    try {
        // まずローカルファイルの存在を確認
        if (await checkFileExists(localPath)) {
            currentAudio = new Audio(localPath);
            await currentAudio.play();
            console.log(`ローカルファイルを再生中: ${localPath}`);
        } else {
            // ローカルファイルが見つからない場合、サンプルファイルを使用
            if (await checkFileExists(samplePath)) {
                currentAudio = new Audio(samplePath);
                await currentAudio.play();
                console.log('サンプルファイルを再生中');
            } else {
                throw new Error('サンプルファイルも見つかりません');
            }
        }
    } catch (error) {
        console.error('音楽の再生に失敗しました:', error);
        alert(`音楽の再生に失敗しました。ローカルファイル (${localPath}) とサンプルファイルが見つからないか、ブラウザがサポートしていない可能性があります。`);
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
        const musicCell = row.insertCell(3);
        const button = document.createElement('button');
        button.textContent = "▶ 再生";
        button.onclick = () => playMusic(item.audioSource, item.trackNumber);
        musicCell.appendChild(button);
    });
}

// ページロード時に全てのファイルの存在をチェック
async function checkAllFiles() {
    for (const item of programData) {
        const path = `audio/${item.audioSource.toLowerCase()}/${item.trackNumber}.mp3`;
        const exists = await checkFileExists(path);
        console.log(`ファイル ${path} の存在: ${exists ? "あり" : "なし"}`);
    }
    console.log('サンプルファイルの存在:', await checkFileExists('audio/sample.mp3'));
}

// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', () => {
    generateTable();
    checkAllFiles();
});
