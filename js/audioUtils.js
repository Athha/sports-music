import { programData, updateProgramData } from '/sports-music/js/app.js';

export function checkAudioFileStatus() {
    console.log('Checking audio file status');
    if (!programData || !Array.isArray(programData)) {
        console.error('Program data is not initialized or is not an array');
        return;
    }
    
    const updatedProgramData = programData.map(item => {
        if (!item.isSection && item.audioFile) {
            if (!isValidBlobUrl(item.audioFile)) {
                console.log('Updating status for item:', item);
                return { ...item, audioFile: null };
            }
        }
        return item;
    });

    updateProgramData(updatedProgramData);
    console.log('Audio file status check completed');
}

function isValidBlobUrl(file) {
    return file && file instanceof File;
}


export function handleFileSelect(event, index) {
    const file = event.target.files[0];
    if (file) {
        programData[index].audioFile = file;
        document.getElementById(`file-name-${index}`).textContent = file.name;
        updateStatus(index, 'local');
        updateProgramData(programData);
    }
}


export function toggleMusic(index) {
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
        // ファイルのパスが正しいことを確認
        const audioUrl = URL.createObjectURL(item.audioFile);
        currentAudio = new Audio(audioUrl);
        currentAudioIndex = index;
        currentAudio.play();
        updatePlayButtonText(index, '■ 停止');
    }
}

export function stopAllMusic() {
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
